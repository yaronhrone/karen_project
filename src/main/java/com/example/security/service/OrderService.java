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


    public Integer createOrder(String username) {
        Order order = new Order();
        order.setStatus(Status.OPEN);
        order.setUsername(username);
        order.setAddressShipping(userService.getUserByUsername(username).getAddress());
        order.setTotalPrice(BigDecimal.valueOf(0.0));

        return orderRepository.createOrder(order);
    }
    public String addToOrder(String username ,int productId) {
          int orderId = 0;
          int quantity = 1;
           if (orderRepository.getAllOrderOpen(username).isEmpty()) {
             orderId =  createOrder(username);


           } else {
               orderId = orderRepository.getAllOrderOpen(username).getFirst().getId();

               if (orderRepository.getProductQuantityFromOrder(orderId, productId) != 0) {
                   orderRepository.addQuantityToOrderItem(orderId,productId);
                   System.out.println(orderRepository.getProductQuantityFromOrder(orderId, productId));
                   List<Order> order = getAllOrderByUsername(username);
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
           List<Order> order = getAllOrderByUsername(username);
           orderRepository.updateTotalPriceInOrder(calculateTotalPrice(order.getLast().getOrderItems()) , orderId);
        return "Order item added successfully";
    }
    public String removeItemFromOrder(String username ,int productId) {
        if (orderRepository.getAllOrderOpen(username).isEmpty()) {
            return "Order not found";
        }
        int orderId = orderRepository.getAllOrderOpen(username).getFirst().getId();
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
    public String changeOrderStatus(String username) {

        return orderRepository.changeOrderStatusToClose(username);
    }
    public String deleteOrder(int orderId) {
        Order order = orderRepository.getOrderById(orderId);
        if (order == null) {
            return "Order not found";
        }
        orderRepository.deleteAllOrderItemsByOrderId(orderId);
        return orderRepository.deleteOrder(orderId);
    }
    public String deleteAllOrders(String username) {
        List<Order> orders = orderRepository.getAllOrderByUsername(username);
        for (Order order : orders) {
            orderRepository.deleteAllOrderItemsByOrderId(order.getId());
            orderRepository.deleteOrder(order.getId());

        }

        return "Orders deleted successfully";
    }
    public List<Order> getAllOrderByUsername(String username) {
        List<Order> orders = orderRepository.getAllOrderByUsername(username);
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
