package com.perfume.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderRequest {
    @NotNull(message = "Address ID is required")
    private Long addressId;

    private String couponCode;
    private String paymentMethod = "COD";
    private String notes;
}
