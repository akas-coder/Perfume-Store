package com.perfume.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CouponRequest {
    @NotBlank(message = "Coupon code is required")
    @Size(max = 50)
    private String code;

    @NotBlank(message = "Coupon type is required")
    private String type;

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal discountValue;

    private BigDecimal minOrderAmount = BigDecimal.ZERO;
    private BigDecimal maxDiscountAmount;

    private Integer usageLimit;
    private Boolean isActive = true;
    private LocalDate validFrom;
    private LocalDate validUntil;
}
