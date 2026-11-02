package com.example.security.service;


import com.example.security.model.*;
import com.example.security.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private UserService userService;

    @Autowired
    private ItemService itemService;
    @Autowired
    private WhatsAppNotificationService whatsAppNotificationService;

    // Admin's order board (AdminOrders.jsx groups these 3 into their own
    // sections client-side: RECEIVED = "open", IN_PROGRESS = "in prep",
    // READY = "ready, awaiting handoff to the customer". SENT (the customer
    // actually has it - the real final step, split out from READY 2026-09-10)
    // is deliberately NOT in this list, same as CANCELLED - both drop off
    // the active board entirely once set, still findable via admin's
    // search-by-order-number.
    private static final List<String> ADMIN_BOARD_STATUSES = List.of("RECEIVED", "IN_PROGRESS", "READY");
    // Every status advanceOrderStatus is allowed to set - not just forward
    // steps anymore now that CANCELLED is settable from RECEIVED or
    // IN_PROGRESS too (see AdminOrders.jsx for when each button shows).
    private static final List<String> SETTABLE_STATUSES = List.of("IN_PROGRESS", "READY", "SENT", "CANCELLED");


    // Chocolate boxes are catalog items whose category is "chocolate-box-<size>"
    // (e.g. chocolate-box-9) - the size is how many chocolates the box holds.
    // The chocolates that fill them are ordinary "chocolate" items, which are
    // never ordered on their own.
    private static final String BOX_CATEGORY_PREFIX = "chocolate-box-";
    private static final String CHOCOLATE_CATEGORY = "chocolate";
    private static final ObjectMapper JSON = new ObjectMapper();

    private static Integer boxSize(Item item) {
        if (item == null || item.getCategory() == null || !item.getCategory().startsWith(BOX_CATEGORY_PREFIX)) {
            return null;
        }
        try {
            return Integer.parseInt(item.getCategory().substring(BOX_CATEGORY_PREFIX.length()));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    // Statuses of an order whose stock was taken and is not yet with the customer. SENT (handed over) is left out on purpose: deleting an old delivered order must not put stock back.
    private static final List<String> STOCK_TAKEN_STATUSES = List.of("RECEIVED", "IN_PROGRESS", "READY");
    private static final String STOCK_UNVERIFIED_MESSAGE = "לא הצלחנו לאמת את המלאי כרגע, נסו שוב בעוד רגע";

    // What a set of order lines takes out of stock, per product id: a normal
    // line takes its quantity of that product; a box line takes the box itself
    // plus every chocolate in it.
    private static Map<Integer, Integer> stockNeeds(List<OrderItem> lines) {
        Map<Integer, Integer> needs = new LinkedHashMap<>();
        for (OrderItem line : lines) {
            needs.merge(line.getProductId(), line.getQuantity(), Integer::sum);
            if (line.getComposition() != null) {
                for (BoxChocolate chocolate : line.getComposition()) {
                    needs.merge(chocolate.id(), chocolate.quantity() * line.getQuantity(), Integer::sum);
                }
            }
        }
        return needs;
    }

    private static List<StockLine> toStockLines(Map<Integer, Integer> needs) {
        List<StockLine> lines = new ArrayList<>();
        needs.forEach((id, quantity) -> lines.add(new StockLine(id, quantity)));
        return lines;
    }

    // Refuses (with a message the customer sees) when one of `ids` needs more
    // than is in stock. Only the ids being added or changed are checked, so an
    // unrelated item in the cart that ran out later does not block this action.
    // A product with no stock number is not tracked and always passes. This is
    // the early warning - the real check is the atomic take when the order is sent.
    private void assertInStock(Map<Integer, Integer> needs, Collection<Integer> ids) {
        for (int id : ids) {
            Item item = itemService.getItemById(id);
            if (item == null || item.getStock() == null) {
                continue;
            }
            if (item.getStock() < needs.getOrDefault(id, 0)) {
                throw new IllegalArgumentException(item.getName() + (item.getStock() <= 0 ? " - חסר במלאי" : " - אין מספיק במלאי"));
            }
        }
    }

    // Takes the order's stock after the order was claimed (marked RECEIVED). If
    // anything is short, or the check could not be done, the order goes back to
    // OPEN and the customer gets the reason - nothing was taken in that case.
    private void takeStockOrRevert(int orderId, List<StockLine> lines) {
        if (lines.isEmpty()) {
            return;
        }
        List<String> missing;
        try {
            missing = itemService.takeStock(lines);
        } catch (RuntimeException e) {
            orderRepository.revertOrderToOpen(orderId);
            throw new IllegalStateException(STOCK_UNVERIFIED_MESSAGE, e);
        }
        if (missing == null) {
            orderRepository.revertOrderToOpen(orderId);
            throw new IllegalStateException(STOCK_UNVERIFIED_MESSAGE);
        }
        if (!missing.isEmpty()) {
            orderRepository.revertOrderToOpen(orderId);
            throw new OutOfStockException("המלאי אזל עבור: " + String.join(", ", missing) + ". הסירו אותם מההזמנה ונסו שוב.");
        }
    }

    // Gives the stock back when an order that had taken it is cancelled or deleted.
    private void restoreStockOf(Order order) {
        if (order == null || order.getStatus() == null || !STOCK_TAKEN_STATUSES.contains(order.getStatus().name())) {
            return;
        }
        try {
            itemService.restoreStock(toStockLines(stockNeeds(orderRepository.getOrderItemsByOrderId(order.getId()))));
        } catch (Exception e) {
            System.err.println("Failed to give stock back for order " + order.getId() + ": " + e.getMessage());
        }
    }

    public Integer createOrder(String email) {
        Order order = new Order();
        order.setStatus(Status.OPEN);
        order.setUserEmail(email);
        order.setAddressShipping(userService.getUserByEmail(email).getAddress());
        order.setTotalPrice(BigDecimal.valueOf(0.0));

        return orderRepository.createOrder(order);
    }
    public String addToOrder(String email ,int productId) {
          int orderId;
          int quantity = 1;
          // Check the product exists before touching any order state - a
          // nonexistent/deleted productId used to NPE straight through
          // .getPrice() below (only after possibly already creating a new
          // empty order for the customer).
          Item product = itemService.getItemById(productId);
          if (product == null) {
              return "Item not found";
          }
          if (CHOCOLATE_CATEGORY.equals(product.getCategory())
                  || (product.getCategory() != null && product.getCategory().startsWith(BOX_CATEGORY_PREFIX))) {
              throw new IllegalArgumentException("שוקולדים מוזמנים במארז - יש לבחור מארז בעמוד המארזים");
          }
          List<Order> openOrders = orderRepository.getAllOrderOpen(email);
          int inCart = openOrders.isEmpty() ? 0 : orderRepository.getProductQuantityFromOrder(openOrders.getFirst().getId(), productId);
          assertInStock(Map.of(productId, inCart + 1), List.of(productId));
           if (openOrders.isEmpty()) {
             orderId =  createOrder(email);

           } else {
               orderId = openOrders.getFirst().getId();

               if (orderRepository.getProductQuantityFromOrder(orderId, productId) != 0) {
                   orderRepository.addQuantityToOrderItem(orderId,productId);
                   updateOrderTotal(orderId);
                   return " The item added successfully";
               }
           }
           OrderItem orderItem = new OrderItem();
           orderItem.setProductId(productId);
           orderItem.setOrderId(orderId);
           orderItem.setQuantity(quantity);
           orderItem.setPrice(product.getPrice());
           orderRepository.addOrderItem(orderItem);
           updateOrderTotal(orderId);
        return "Order item added successfully";
    }

    // Adds one chocolate box to the customer's open order. Everything that
    // matters is decided here, not by the client: the price comes from the
    // box's catalog item, the box must be a real chocolate-box-<size> item,
    // every chocolate must be a real chocolate, and the quantities must fill
    // the box exactly.
    public String addBoxToOrder(String email, AddBoxRequest request) {
        if (request == null || request.chocolates() == null || request.chocolates().isEmpty()) {
            throw new IllegalArgumentException("לא נבחרו פרלינים למארז");
        }
        Item box = itemService.getItemById(request.boxItemId());
        Integer size = boxSize(box);
        if (size == null) {
            throw new IllegalArgumentException("המארז לא נמצא");
        }
        String compositionJson = buildComposition(size, request.chocolates());

        List<Order> openOrders = orderRepository.getAllOrderOpen(email);
        Map<Integer, Integer> needs = openOrders.isEmpty()
                ? new LinkedHashMap<>()
                : stockNeeds(orderRepository.getOrderItemsByOrderId(openOrders.getFirst().getId()));
        needs.merge(box.getId(), 1, Integer::sum);
        List<Integer> touched = new ArrayList<>(List.of(box.getId()));
        for (BoxChoice choice : request.chocolates()) {
            needs.merge(choice.id(), choice.quantity(), Integer::sum);
            touched.add(choice.id());
        }
        assertInStock(needs, touched);
        int orderId = openOrders.isEmpty() ? createOrder(email) : openOrders.getFirst().getId();
        OrderItem line = new OrderItem();
        line.setProductId(box.getId());
        line.setOrderId(orderId);
        line.setQuantity(1);
        line.setPrice(box.getPrice());
        orderRepository.addBoxOrderItem(line, compositionJson);
        updateOrderTotal(orderId);
        return "Box added successfully";
    }

    // Checks the chosen chocolates against the box size and returns what gets
    // stored on the order line (names are looked up here, never trusted from
    // the client).
    private String buildComposition(int size, List<BoxChoice> choices) {
        if (choices == null || choices.isEmpty()) {
            throw new IllegalArgumentException("לא נבחרו פרלינים למארז");
        }
        List<BoxChocolate> composition = new ArrayList<>();
        int total = 0;
        for (BoxChoice choice : choices) {
            if (choice.quantity() < 1) {
                throw new IllegalArgumentException("כמות לא תקינה במארז");
            }
            Item chocolate = itemService.getItemById(choice.id());
            if (chocolate == null || !CHOCOLATE_CATEGORY.equals(chocolate.getCategory())) {
                throw new IllegalArgumentException("פרלין לא נמצא");
            }
            composition.add(new BoxChocolate(chocolate.getId(), chocolate.getName(), choice.quantity()));
            total += choice.quantity();
        }
        if (total != size) {
            throw new IllegalArgumentException("המארז צריך להכיל בדיוק " + size + " פרלינים");
        }
        try {
            return JSON.writeValueAsString(composition);
        } catch (Exception e) {
            throw new IllegalStateException("Could not store the box contents", e);
        }
    }

    // Changes what is inside a box that is still in the open (not yet sent)
    // order. A sent order has no OPEN status, so it can no longer be edited.
    public String updateBoxInOrder(String email, int orderItemId, UpdateBoxRequest request) {
        List<Order> openOrders = orderRepository.getAllOrderOpen(email);
        if (openOrders.isEmpty()) {
            return "Order not found";
        }
        int orderId = openOrders.getFirst().getId();
        OrderItem line = orderRepository.getOrderItemsByOrderId(orderId).stream()
                .filter(oi -> oi.getId() == orderItemId && oi.getComposition() != null)
                .findFirst()
                .orElse(null);
        if (line == null) {
            return "Box not found in order";
        }
        Integer size = boxSize(itemService.getItemById(line.getProductId()));
        if (size == null) {
            throw new IllegalArgumentException("המארז לא נמצא");
        }
        String compositionJson = buildComposition(size, request == null ? null : request.chocolates());
        // The box itself is already in the order; only the chocolates change.
        List<OrderItem> otherLines = orderRepository.getOrderItemsByOrderId(orderId).stream()
                .filter(oi -> oi.getId() != orderItemId)
                .toList();
        Map<Integer, Integer> needs = stockNeeds(otherLines);
        List<Integer> touched = new ArrayList<>();
        for (BoxChoice choice : request.chocolates()) {
            needs.merge(choice.id(), choice.quantity(), Integer::sum);
            touched.add(choice.id());
        }
        assertInStock(needs, touched);
        orderRepository.updateBoxComposition(orderId, orderItemId, compositionJson);
        return "Box updated successfully";
    }

    public String removeBoxFromOrder(String email, int orderItemId) {
        List<Order> openOrders = orderRepository.getAllOrderOpen(email);
        if (openOrders.isEmpty()) {
            return "Order not found";
        }
        int orderId = openOrders.getFirst().getId();
        if (orderRepository.deleteOrderItemById(orderId, orderItemId) == 0) {
            return "Box not found in order";
        }
        if (orderRepository.getOrderItemsByOrderId(orderId).isEmpty()) {
            orderRepository.deleteOrder(orderId);
        } else {
            updateOrderTotal(orderId);
        }
        return "Box removed successfully";
    }

    // Was: both call sites above reloaded the customer's ENTIRE order
    // history (getAllOrderByEmail - one query per past order plus a 5x
    // Feign fan-out per item in each, see allOrderItemsInfo) just to read
    // the total of the single order that changed. Recomputes only that
    // order's own items instead.
    private void updateOrderTotal(int orderId) {
        List<OrderItem> items = allOrderItemsInfo(orderRepository.getOrderItemsByOrderId(orderId));
        orderRepository.updateTotalPriceInOrder(calculateTotalPrice(items), orderId);
    }
    public String removeItemFromOrder(String email ,int productId) {
        if (orderRepository.getAllOrderOpen(email).isEmpty()) {
            return "Order not found";
        }
        int orderId = orderRepository.getAllOrderOpen(email).getFirst().getId();
        if (orderRepository.getProductQuantityFromOrder(orderId,productId ) == null) {
            return "Product not found in order";
        }
        int quantity = orderRepository.getProductQuantityFromOrder(orderId,productId );
        if (quantity == 1) {
            orderRepository.deleteOrderItemsByOrderId(orderId, productId);
            if (orderRepository.getOrderItemsByOrderId(orderId).isEmpty()){
            orderRepository.deleteOrder(orderId);}
            return "Order item deleted successfully";}
        OrderItem orderItem = new OrderItem();
        orderItem.setProductId(productId);;
        orderItem.setOrderId(orderId);
        orderItem.setQuantity(quantity);

        orderRepository.updateOrderItem(orderItem);
        return "Order item updated successfully";
    }
    public String changeOrderStatus(String email, String note) {
        // Blank means "no remark" - store NULL rather than an empty string.
        String cleanNote = note == null || note.isBlank() ? null : note.trim();
        String result = "Order status updated successfully";

        // Sending is also where the stock goes down. Claim the order first (only
        // one request can turn it from OPEN to RECEIVED, so a double click takes
        // stock once), then take the stock; if it is short, the order goes back
        // to OPEN and the customer is told which items ran out.
        List<Order> openOrders = orderRepository.getAllOrderOpen(email);
        if (openOrders.isEmpty()) {
            return result;
        }
        int orderId = openOrders.getFirst().getId();
        List<StockLine> stockLines = toStockLines(stockNeeds(orderRepository.getOrderItemsByOrderId(orderId)));
        if (orderRepository.markOrderReceived(orderId, cleanNote) == 0) {
            return result;
        }
        takeStockOrRevert(orderId, stockLines);

        // Notify Keren over WhatsApp that a new order came in, so she isn't
        // relying on manually checking Admin for it. A failure here (GreenAPI
        // not configured yet, network hiccup, ...) must not fail the
        // customer's request - the order itself already went through.
        try {
            List<Order> orders = orderRepository.getAllOrderByEmail(email);
            Order justSent = orders.stream()
                    .filter(o -> "RECEIVED".equals(o.getStatus().name()))
                    .reduce((first, second) -> second) // latest one
                    .orElse(null);
            if (justSent != null) {
                justSent.setOrderItems(allOrderItemsInfo(orderRepository.getOrderItemsByOrderId(justSent.getId())));
                CustomUser customer = userService.getUserByEmail(email);
                whatsAppNotificationService.sendNewOrderNotification(justSent, customer);
            }
        } catch (Exception e) {
            // Deliberately swallowed - the order itself must succeed even if
            // the notification fails (GreenAPI down, bad credentials,
            // network). But silent failure here means Keren never finds out
            // an order came in, with zero trace anywhere - log it so a real
            // misconfiguration is actually diagnosable instead of invisible.
            System.err.println("Failed to send WhatsApp new-order notification: " + e.getMessage());
        }

        return result;
    }

    public String advanceOrderStatus(int orderId, String newStatus, java.time.LocalDate readyBy) {
        if (!SETTABLE_STATUSES.contains(newStatus)) {
            return "Invalid status";
        }
        Order before = "CANCELLED".equals(newStatus) ? orderRepository.getOrderById(orderId) : null;
        // readyBy only ever gets written on the RECEIVED -> IN_PROGRESS
        // transition; ready_at/sent_at only on their own matching
        // transition - every other target status uses the plain update,
        // which never touches any of these (see OrderRepository comments on
        // why that separation matters - a later status change must never
        // overwrite an already-set value from an earlier one).
        if ("IN_PROGRESS".equals(newStatus)) {
            orderRepository.updateOrderStatusAndReadyBy(orderId, newStatus, readyBy);
        } else if ("READY".equals(newStatus)) {
            orderRepository.updateOrderStatusAndReadyAt(orderId, newStatus);
        } else if ("SENT".equals(newStatus)) {
            orderRepository.updateOrderStatusAndSentAt(orderId, newStatus);
        } else {
            orderRepository.updateOrderStatus(orderId, newStatus);
        }
        // A cancelled order no longer needs what it took from stock.
        if (before != null && !"CANCELLED".equals(before.getStatus().name())) {
            restoreStockOf(before);
        }
        return "Order status updated successfully";
    }

    // Every order Keren's admin board shows, across all 3 of its sections -
    // AdminOrders.jsx groups these by status client-side, one request
    // instead of three.
    public List<Order> getOrdersForAdminBoard() {
        List<Order> orders = orderRepository.getOrdersByStatuses(ADMIN_BOARD_STATUSES);
        for (Order order : orders) {
            order.setOrderItems(allOrderItemsInfo(orderRepository.getOrderItemsByOrderId(order.getId())));
            order.setTotalPrice(calculateTotalPrice(order.getOrderItems()));
        }
        return orders;
    }

    // Admin's search-by-order-number - unlike the board above, this isn't
    // limited to RECEIVED/IN_PROGRESS/READY, so it can also find an old
    // CANCELLED order or one further back than the board's own pagination
    // shows, without Keren needing to know its status ahead of time.
    public Order getOrderByIdForAdmin(int orderId) {
        Order order = orderRepository.getOrderById(orderId);
        if (order == null) {
            return null;
        }
        order.setOrderItems(allOrderItemsInfo(orderRepository.getOrderItemsByOrderId(order.getId())));
        order.setTotalPrice(calculateTotalPrice(order.getOrderItems()));
        return order;
    }
    public String deleteOrder(int orderId, String callerEmail, boolean isAdmin) {
        Order order = orderRepository.getOrderById(orderId);
        if (order == null) {
            return "Order not found";
        }
        if (!isAdmin && !order.getUserEmail().equals(callerEmail)) {
            return "Not authorized to delete this order";
        }
        restoreStockOf(order);
        orderRepository.deleteAllOrderItemsByOrderId(orderId);
        return orderRepository.deleteOrder(orderId);
    }
    public String deleteAllOrders(String email) {
        List<Order> orders = orderRepository.getAllOrderByEmail(email);
        for (Order order : orders) {
            restoreStockOf(order);
            orderRepository.deleteAllOrderItemsByOrderId(order.getId());
            orderRepository.deleteOrder(order.getId());

        }

        return "Orders deleted successfully";
    }
    public List<Order> getAllOrderByEmail(String email) {
        List<Order> orders = orderRepository.getAllOrderByEmail(email);
for (Order order : orders) {
 order.setOrderItems(  allOrderItemsInfo(
        orderRepository.getOrderItemsByOrderId(order.getId())));
    order.setTotalPrice(calculateTotalPrice(order.getOrderItems()));

}

        return orders;
    }
    public List<OrderItem> allOrderItemsInfo(List<OrderItem> order) {

        // Was 5 separate Feign calls to items-service per order item (one
        // each for name/image/description/veg/price) - fetch once and reuse.
        for (OrderItem item : order) {
            Item product = itemService.getItemById(item.getProductId());
            // ItemsClientFallback returns null when items-service is briefly
            // unreachable (Feign circuit breaker) - skip enriching this line
            // rather than NPE the whole order view over one transient hiccup.
            if (product == null) {
                continue;
            }
            item.setName(product.getName());
            item.setImage(product.getImage());
            item.setDescription(product.getDescription());
            item.setVeg(product.getVeg());
            item.setCategory(product.getCategory());
            item.setTotalPrice(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        }

        return order;

    }
    private BigDecimal calculateTotalPrice(List<OrderItem> items) {
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItem item : items) {
            BigDecimal itemPrice = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            total = total.add(itemPrice);
        }

        return total;
    }
}
