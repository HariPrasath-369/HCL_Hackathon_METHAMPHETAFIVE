package com.retail.orderingsystem.service;

import com.retail.orderingsystem.entity.Order;
import com.retail.orderingsystem.entity.OrderStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    public void sendOrderConfirmation(Order order) {
        try {
            logger.info("Sending order confirmation email for Order ID: {} to {}", order.getId(),
                    order.getUser().getEmail());

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(order.getUser().getEmail());
            helper.setSubject("Order Confirmation - Order #" + order.getId());

            String htmlContent = "<h2>Thank you for your order!</h2>"
                    + "<p>Hi " + order.getUser().getName() + ",</p>"
                    + "<p>Your order #" + order.getId() + " has been confirmed.</p>"
                    + "<p><strong>Total Amount:</strong> $" + order.getTotalAmount() + "</p>"
                    + "<h3>Order Details:</h3>"
                    + "<ul>";

            for (var item : order.getItems()) {
                htmlContent += "<li>" + item.getProduct().getName() + " (x" + item.getQuantity() + ") - $"
                        + item.getPriceAtTimeOfOrder() + "</li>";
            }

            htmlContent += "</ul>"
                    + "<p>We will notify you once it's out for delivery.</p>";

            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Order confirmation email sent successfully for Order ID: {}", order.getId());

        } catch (MessagingException e) {
            logger.error("Failed to send order confirmation email to {}: MessagingException - {}",
                    order.getUser().getEmail(), e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error while sending order confirmation email for Order ID: {}: {}",
                    order.getId(), e.getMessage(), e);
        }
    }

    public void sendStatusUpdate(Order order) {
        try {
            logger.info("Sending order status update email for Order ID: {} to {}", order.getId(),
                    order.getUser().getEmail());

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(order.getUser().getEmail());
            helper.setSubject("Order Status Update - Order #" + order.getId());

            String statusTitle = "Your order is " + order.getStatus().toString().replace("_", " ");
            String statusMsg = "";

            if (order.getStatus() == OrderStatus.CONFIRMED) {
                statusMsg = "We have accepted your order and are preparing it.";
            } else if (order.getStatus() == OrderStatus.OUT_FOR_DELIVERY) {
                statusMsg = "Good news! Your order is on its way and will reach you shortly.";
            } else if (order.getStatus() == OrderStatus.DELIVERED) {
                statusMsg = "Your order has been delivered. Please confirm receipt on your dashboard.";
            }

            String htmlContent = "<h2>" + statusTitle + "</h2>"
                    + "<p>Hi " + order.getUser().getName() + ",</p>"
                    + "<p>" + statusMsg + "</p>"
                    + "<p><strong>Order ID:</strong> #" + order.getId() + "</p>"
                    + "<p>Thank you for shopping with us!</p>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
            logger.info("Order status update email sent successfully for Order ID: {}", order.getId());

        } catch (MessagingException e) {
            logger.error("Failed to send status update email for Order ID: {}: MessagingException - {}",
                    order.getId(), e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error while sending status update email for Order ID: {}: {}",
                    order.getId(), e.getMessage(), e);
        }
    }
}
