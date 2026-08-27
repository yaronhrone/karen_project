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

    private static final List<String> ACTIVE_ORDER_STATUSES = List.of("RECEIVED", "IN_PROGRESS");
    private static final List<String> ADVANCEABLE_STATUSES = List.of("IN_PROGRESS", "READY");


    public Integer createOrder(String email) {
        Order order = new Order();
        order.setStatus(Status.OPEN);
        order.setUserEmail(email);
        order.setAddressShipping(userService.getUserByEmail(email).getAddress());
        order.setTotalPrice(BigDecimal.valueOf(0.0));

        return orderRepository.createOrder(order);
    }
    public String addToOrder(String email ,int productId) {
          int orderId = 0;
          int quantity = 1;
           if (orderRepository.getAllOrderOpen(email).isEmpty()) {
             orderId =  createOrder(email);


           } else {
               orderId = orderRepository.getAllOrderOpen(email).getFirst().getId();

               if (orderRepository.getProductQuantityFromOrder(orderId, productId) != 0) {
                   orderRepository.addQuantityToOrderItem(orderId,productId);
                   System.out.println(orderRepository.getProductQuantityFromOrder(orderId, productId));
                   List<Order> order = getAllOrderByEmail(email);
                   orderRepository.updateTotalPriceInOrder(calculateTotalPrice(order.getLast().getOrderItems()) , orderId);
                   return " The item added successfully";
               }
           }
           OrderItem orderItem = new OrderItem();
           orderItem.setProductId(productId);
           orderItem.setOrderId(orderId);
           orderItem.setQuantity(quantity);
           orderItem.setPrice(itemService.getItemById(productId).getPrice());
           orderRepository.addOrderItem(orderItem);
           List<Order> order = getAllOrderByEmail(email);
           orderRepository.updateTotalPriceInOrder(calculateTotalPrice(order.getLast().getOrderItems()) , orderId);
        return "Order item added successfully";
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
                String customerPhone = userService.getUserByEmail(email).getPhone();
                whatsAppNotificationService.sendNewOrderNotification(justSent, customerPhone);
            }
        } catch (Exception e) {
            System.out.println(e.getMessage() + " - failed to send WhatsApp new-order notification");
        }

        return result;
    }

    public String advanceOrderStatus(int orderId, String newStatus) {
        if (!ADVANCEABLE_STATUSES.contains(newStatus)) {
            return "Invalid status";
        }
        orderRepository.updateOrderStatus(orderId, newStatus);
        return "Order status updated successfully";
    }

    // Keren's "active orders" inbox - orders already sent by a customer that
    // still need her attention (not yet marked ready/shipped).
    public List<Order> getActiveOrders() {
        List<Order> orders = orderRepository.getOrdersByStatuses(ACTIVE_ORDER_STATUSES);
        for (Order order : orders) {
            order.setOrderItems(allOrderItemsInfo(orderRepository.getOrderItemsByOrderId(order.getId())));
            order.setTotalPrice(calculateTotalPrice(order.getOrderItems()));
        }
        return orders;
    }
    public String deleteOrder(int orderId) {
        Order order = orderRepository.getOrderById(orderId);
        if (order == null) {
            return "Order not found";
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


        for (OrderItem item : order) {


            item.setName(itemService.getItemById(item.getProductId()).getName());
//            item.setPrice(itemService.getItemById(item.getProductId()).getPrice());
            item.setImage(itemService.getItemById(item.getProductId()).getImage());
            item.setDescription(itemService.getItemById(item.getProductId()).getDescription());
            item.setVeg(itemService.getItemById(item.getProductId()).getVeg());
            item.setTotalPrice(itemService.getItemById(item.getProductId()).getPrice().multiply( BigDecimal.valueOf(item.getQuantity())));
//            item.setQuantity(orderRepository.getProductQuantityFromOrder(item.getOrderId(),item.getProductId()));
            }

        System.out.println(order + " order items");
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
