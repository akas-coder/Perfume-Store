package com.perfume.dto.response;

import com.perfume.model.Order;
import com.perfume.model.OrderItem;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private String status;
    private String paymentStatus;
    private String paymentMethod;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal shippingCharge;
    private BigDecimal totalAmount;
    private String couponCode;
    private String customerName;
    private String customerEmail;
    private List<OrderItemResponse> items;
    private AddressResponse address;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productBrand;
        private String productImage;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
        private String giftPackaging;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressResponse {
        private String fullName;
        private String phone;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String state;
        private String pincode;
    }

    public static OrderResponse from(Order order) {
        List<OrderItemResponse> items = order.getItems() != null
                ? order.getItems().stream().map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                        .productName(item.getProductName())
                        .productBrand(item.getProductBrand())
                        .productImage(item.getProductImage())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .giftPackaging(item.getGiftPackaging() != null ? item.getGiftPackaging().name() : "NORMAL")
                        .build())
                        .collect(Collectors.toList())
                : List.of();

        AddressResponse addr = null;
        if (order.getAddress() != null) {
            addr = AddressResponse.builder()
                    .fullName(order.getAddress().getFullName())
                    .phone(order.getAddress().getPhone())
                    .addressLine1(order.getAddress().getAddressLine1())
                    .addressLine2(order.getAddress().getAddressLine2())
                    .city(order.getAddress().getCity())
                    .state(order.getAddress().getState())
                    .pincode(order.getAddress().getPincode())
                    .build();
        }

        String custName = order.getUser() != null ? order.getUser().getName() : "Unknown";
        String custEmail = order.getUser() != null ? order.getUser().getEmail() : "Unknown";

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus().name())
                .paymentStatus(order.getPaymentStatus().name())
                .paymentMethod(order.getPaymentMethod())
                .subtotal(order.getSubtotal())
                .discountAmount(order.getDiscountAmount())
                .shippingCharge(order.getShippingCharge())
                .totalAmount(order.getTotalAmount())
                .couponCode(order.getCoupon() != null ? order.getCoupon().getCode() : null)
                .customerName(custName)
                .customerEmail(custEmail)
                .items(items)
                .address(addr)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
