package com.perfume.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductRequest {
    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "Brand is required")
    private String brand;

    private String description;

    @NotNull(message = "Original price is required")
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal originalPrice;

    private BigDecimal discountPrice;

    private Long categoryId;

    @NotBlank(message = "Gender is required")
    private String gender;

    private String fragranceFamily;
    private String topNotes;
    private String middleNotes;
    private String baseNotes;

    private Boolean isFeatured = false;
    private Boolean isBestSeller = false;
    private Boolean isNewArrival = false;
    private Boolean isLuxury = false;
    private Boolean isActive = true;

    @Min(0)
    private Integer stockQuantity = 0;

    private Integer lowStockThreshold = 10;
}
