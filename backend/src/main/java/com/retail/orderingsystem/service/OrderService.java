package com.retail.orderingsystem.service;

import com.retail.orderingsystem.entity.Order;
import com.retail.orderingsystem.entity.User;

import java.util.List;

public interface OrderService {
    Order placeOrder(User user); // Legacy method, may be kept or replaced
    Order confirmOrderAfterPayment(User user, String paymentIntentId);
    Order confirmCodOrder(User user);
    List<Order> getOrderHistory(User user);
    Order getOrderById(Long orderId);
    Order reorder(User user, Long orderId);
    List<Order> getAllOrders();
    Order updateOrderStatus(Long orderId, com.retail.orderingsystem.entity.OrderStatus status);
}
