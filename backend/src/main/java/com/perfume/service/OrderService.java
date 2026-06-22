package com.perfume.service;

import com.perfume.dto.request.OrderRequest;
import com.perfume.dto.response.OrderResponse;
import com.perfume.model.*;
import com.perfume.repository.*;
import com.perfume.util.OrderNumberGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {
    

    @Autowired private OrderRepository orderRepository;
    @Autowired private OrderItemRepository orderItemRepository;
    @Autowired private CartService cartService;
    @Autowired private CartRepository cartRepository;
    @Autowired private AddressRepository addressRepository;
    @Autowired private InventoryRepository inventoryRepository;
    @Autowired private CouponRepository couponRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProductRepository productRepository;

    @Transactional
    public OrderResponse placeOrder(Long userId, OrderRequest request) {
        Cart cart = cartService.getCart(userId);
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        Address address = addressRepository.findById(request.getAddressId())
                .filter(a -> a.getUser().getId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Address not found"));

        // Apply coupon if provided
        Coupon coupon = null;
        if (request.getCouponCode() != null && !request.getCouponCode().isBlank()) {
            coupon = couponRepository.findByCodeAndIsActiveTrue(request.getCouponCode())
                    .filter(Coupon::isValid)
                    .orElseThrow(() -> new RuntimeException("Invalid or expired coupon"));
        } else if (cart.getCoupon() != null) {
            coupon = cart.getCoupon();
        }

        BigDecimal subtotal = cartService.calculateSubtotal(cart);
        BigDecimal discount = coupon != null ? cartService.calculateDiscount(cart, subtotal) : BigDecimal.ZERO;
        BigDecimal afterDiscount = subtotal.subtract(discount);
        BigDecimal shipping = cartService.calculateShipping(afterDiscount);
        BigDecimal total = afterDiscount.add(shipping);

        // Validate stock and decrement
        for (CartItem item : cart.getItems()) {
            Inventory inv = inventoryRepository.findByProductId(item.getProduct().getId())
                    .orElseThrow(() -> new RuntimeException("Inventory not found for: " + item.getProduct().getName()));
            if (inv.getQuantity() < item.getQuantity()) {
                throw new RuntimeException("Insufficient stock for: " + item.getProduct().getName());
            }
            inv.setQuantity(inv.getQuantity() - item.getQuantity());
            inventoryRepository.save(inv);

            // Update sold count
            item.getProduct().setSoldCount(item.getProduct().getSoldCount() + item.getQuantity());
            productRepository.save(item.getProduct());
        }

        // Create order
        Order order = Order.builder()
                .orderNumber(OrderNumberGenerator.generate())
                .user(userRepository.findById(userId).orElseThrow())
                .address(address)
                .coupon(coupon)
                .subtotal(subtotal)
                .discountAmount(discount)
                .shippingCharge(shipping)
                .totalAmount(total)
                .paymentMethod(request.getPaymentMethod())
                .notes(request.getNotes())
                .build();
        order = orderRepository.save(order);

        // Create order items
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getItems()) {
            Product p = cartItem.getProduct();
            String primaryImage = p.getImages() != null && !p.getImages().isEmpty()
                    ? p.getImages().get(0).getImageUrl() : null;

            OrderItem oi = OrderItem.builder()
                    .order(order)
                    .product(p)
                    .productName(p.getName())
                    .productBrand(p.getBrand())
                    .productImage(primaryImage)
                    .quantity(cartItem.getQuantity())
                    .unitPrice(p.getDiscountPrice() != null ? p.getDiscountPrice() : p.getOriginalPrice())
                    .giftPackaging(cartItem.getGiftPackaging())
                    .build();
            orderItems.add(orderItemRepository.save(oi));
        }
        order.setItems(orderItems);

        // Update coupon usage
        if (coupon != null) {
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        }

        // Send notification
        Notification notification = Notification.builder()
                .user(order.getUser())
                .title("Order Placed Successfully!")
                .message("Your order " + order.getOrderNumber() + " has been placed. Total: ₹" + total)
                .type("ORDER_PLACED")
                .build();
        notificationRepository.save(notification);

        // Clear cart
        cartService.clearCart(userId);

        return OrderResponse.from(order);
    }

    public Page<OrderResponse> getUserOrders(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(OrderResponse::from);
    }

    public OrderResponse getOrderById(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return OrderResponse.from(order);
    }

    @Transactional
    public OrderResponse cancelOrder(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() == Order.OrderStatus.SHIPPED || order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new RuntimeException("Cannot cancel a shipped or delivered order");
        }
        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new RuntimeException("Order is already cancelled");
        }

        // Restore inventory
        order.getItems().forEach(item -> {
            if (item.getProduct() != null) {
                inventoryRepository.findByProductId(item.getProduct().getId()).ifPresent(inv -> {
                    inv.setQuantity(inv.getQuantity() + item.getQuantity());
                    inventoryRepository.save(inv);
                });
            }
        });

        order.setStatus(Order.OrderStatus.CANCELLED);
        order = orderRepository.save(order);

        Notification notification = Notification.builder()
                .user(order.getUser())
                .title("Order Cancelled")
                .message("Your order " + order.getOrderNumber() + " has been cancelled.")
                .type("ORDER_CANCELLED")
                .build();
        notificationRepository.save(notification);

        return OrderResponse.from(order);
    }

    // Admin methods
    public Page<OrderResponse> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable).map(OrderResponse::from);
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Order.OrderStatus newStatus;
        try { newStatus = Order.OrderStatus.valueOf(status.toUpperCase()); }
        catch (Exception e) { throw new RuntimeException("Invalid status: " + status); }

        order.setStatus(newStatus);

        Notification notification = Notification.builder()
                .user(order.getUser())
                .title("Order Status Updated")
                .message("Your order " + order.getOrderNumber() + " is now: " + newStatus.name())
                .type("ORDER_STATUS")
                .build();
        notificationRepository.save(notification);

        return OrderResponse.from(orderRepository.save(order));
    }
}
