package com.example.security.service;


import com.example.security.model.*;
import com.example.security.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

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
    // READY = "closed").
    private static final List<String> ADMIN_BOARD_STATUSES = List.of("RECEIVED", "IN_PROGRESS", "READY");
    // Every status advanceOrderStatus is allowed to set - not just forward
    // steps anymore now that CANCELLED is settable from RECEIVED or
    // IN_PROGRESS too (see AdminOrders.jsx for when each button shows).
    private static final List<String> SETTABLE_STATUSES = List.of("IN_PROGRESS", "READY", "CANCELLED");


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
          List<Order> openOrders = orderRepository.getAllOrderOpen(email);
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
    public String changeOrderStatus(String email) {
        String result = orderRepository.changeOrderStatusToReceived(email);

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
        }

        return result;
    }

    public String advanceOrderStatus(int orderId, String newStatus, java.time.LocalDate readyBy) {
        if (!SETTABLE_STATUSES.contains(newStatus)) {
            return "Invalid status";
        }
        // readyBy only ever gets written on the RECEIVED -> IN_PROGRESS
        // transition - every other target status uses the plain update,
        // which never touches ready_by (see OrderRepository comment on
        // updateOrderStatusAndReadyBy for why that separation matters).
        if ("IN_PROGRESS".equals(newStatus)) {
            orderRepository.updateOrderStatusAndReadyBy(orderId, newStatus, readyBy);
        } else {
            orderRepository.updateOrderStatus(orderId, newStatus);
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
    public String deleteOrder(int orderId, String callerEmail, boolean isAdmin) {
        Order order = orderRepository.getOrderById(orderId);
        if (order == null) {
            return "Order not found";
        }
        if (!isAdmin && !order.getUserEmail().equals(callerEmail)) {
            return "Not authorized to delete this order";
        }
        orderRepository.deleteAllOrderItemsByOrderId(orderId);
        return orderRepository.deleteOrder(orderId);
    }
    public String deleteAllOrders(String email) {
        List<Order> orders = orderRepository.getAllOrderByEmail(email);
        for (Order order : orders) {
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
