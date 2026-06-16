package com.perfume.dto.response;

import com.perfume.model.Product;
import com.perfume.model.ProductImage;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String brand;
    private String description;
    private BigDecimal originalPrice;
    private BigDecimal discountPrice;
    private Long categoryId;
    private String categoryName;
    private String gender;
    private String fragranceFamily;
    private String topNotes;
    private String middleNotes;
    private String baseNotes;
    private Boolean isFeatured;
    private Boolean isBestSeller;
    private Boolean isNewArrival;
    private Boolean isLuxury;
    private Boolean isActive;
    private BigDecimal avgRating;
    private Integer reviewCount;
    private Integer soldCount;
    private Integer stockQuantity;
    private Boolean isInStock;
    private Boolean isLowStock;
    private String primaryImage;
    private List<String> images;
    private LocalDateTime createdAt;

    public static ProductResponse from(Product product) {
        String primaryImage = null;
        List<String> images = List.of();

        if (product.getImages() != null && !product.getImages().isEmpty()) {
            primaryImage = product.getImages().stream()
                    .filter(img -> img.getIsPrimary() != null && img.getIsPrimary())
                    .findFirst()
                    .map(ProductImage::getImageUrl)
                    .orElse(product.getImages().get(0).getImageUrl());
            images = product.getImages().stream()
                    .map(ProductImage::getImageUrl)
                    .collect(Collectors.toList());
        }

        Integer stock = 0;
        boolean inStock = false;
        boolean lowStock = false;
        if (product.getInventory() != null) {
            stock = product.getInventory().getQuantity();
            inStock = !product.getInventory().isOutOfStock();
            lowStock = product.getInventory().isLowStock();
        }

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .brand(product.getBrand())
                .description(product.getDescription())
                .originalPrice(product.getOriginalPrice())
                .discountPrice(product.getDiscountPrice())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .gender(product.getGender() != null ? product.getGender().name() : null)
                .fragranceFamily(product.getFragranceFamily())
                .topNotes(product.getTopNotes())
                .middleNotes(product.getMiddleNotes())
                .baseNotes(product.getBaseNotes())
                .isFeatured(product.getIsFeatured())
                .isBestSeller(product.getIsBestSeller())
                .isNewArrival(product.getIsNewArrival())
                .isLuxury(product.getIsLuxury())
                .isActive(product.getIsActive())
                .avgRating(product.getAvgRating())
                .reviewCount(product.getReviewCount())
                .soldCount(product.getSoldCount())
                .stockQuantity(stock)
                .isInStock(inStock)
                .isLowStock(lowStock)
                .primaryImage(primaryImage)
                .images(images)
                .createdAt(product.getCreatedAt())
                .build();
    }
}
