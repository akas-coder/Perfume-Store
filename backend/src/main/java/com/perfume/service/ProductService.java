package com.perfume.service;

import com.perfume.dto.request.ProductRequest;
import com.perfume.dto.response.ProductResponse;
import com.perfume.model.*;
import com.perfume.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired private ProductRepository productRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private InventoryRepository inventoryRepository;
    @Autowired private ProductImageRepository productImageRepository;
    @Autowired private CloudinaryService cloudinaryService;

    public Page<ProductResponse> getAllProducts(int page, int size, String sortBy, String sortDir,
                                                Long categoryId, String gender, String fragranceFamily,
                                                BigDecimal minPrice, BigDecimal maxPrice, Double minRating) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        // Use specification for dynamic filtering
        Page<Product> products;
        if (categoryId != null) {
            products = productRepository.findByCategoryIdAndIsActiveTrue(categoryId, pageable);
        } else {
            products = productRepository.findAll(pageable);
        }

        return products.map(ProductResponse::from);
    }

    public Page<ProductResponse> searchProducts(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.searchProducts(query, pageable).map(ProductResponse::from);
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .filter(p -> p.getIsActive())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return ProductResponse.from(product);
    }

    public List<ProductResponse> getFeaturedProducts() {
        return productRepository.findByIsFeaturedTrueAndIsActiveTrue()
                .stream().map(ProductResponse::from).collect(Collectors.toList());
    }

    public List<ProductResponse> getBestSellers() {
        return productRepository.findByIsBestSellerTrueAndIsActiveTrue()
                .stream().map(ProductResponse::from).collect(Collectors.toList());
    }

    public List<ProductResponse> getNewArrivals() {
        return productRepository.findByIsNewArrivalTrueAndIsActiveTrue()
                .stream().map(ProductResponse::from).collect(Collectors.toList());
    }

    public List<ProductResponse> getLuxuryCollection() {
        return productRepository.findByIsLuxuryTrueAndIsActiveTrue()
                .stream().map(ProductResponse::from).collect(Collectors.toList());
    }

    public List<ProductResponse> getTrending() {
        Pageable top10 = PageRequest.of(0, 10);
        return productRepository.findTopSelling(top10)
                .stream().map(ProductResponse::from).collect(Collectors.toList());
    }

    public List<ProductResponse> getRelatedProducts(Long productId, int limit) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        Long categoryId = product.getCategory() != null ? product.getCategory().getId() : null;
        if (categoryId == null) return List.of();
        Pageable pageable = PageRequest.of(0, limit);
        return productRepository.findRelatedProducts(categoryId, productId, pageable)
                .stream().map(ProductResponse::from).collect(Collectors.toList());
    }

    public List<ProductResponse> getRecommendations(String gender, String fragranceFamily, BigDecimal maxBudget) {
        Product.Gender genderEnum;
        try { genderEnum = Product.Gender.valueOf(gender.toUpperCase()); }
        catch (Exception e) { genderEnum = Product.Gender.UNISEX; }

        Pageable pageable = PageRequest.of(0, 8);
        return productRepository.findByGenderAndFragranceFamily(genderEnum, fragranceFamily, pageable)
                .stream()
                .filter(p -> maxBudget == null || (p.getDiscountPrice() != null ? p.getDiscountPrice() : p.getOriginalPrice()).compareTo(maxBudget) <= 0)
                .map(ProductResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request, List<MultipartFile> images) throws Exception {
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId()).orElse(null);
        }

        Product product = Product.builder()
                .name(request.getName())
                .brand(request.getBrand())
                .description(request.getDescription())
                .originalPrice(request.getOriginalPrice())
                .discountPrice(request.getDiscountPrice())
                .category(category)
                .gender(Product.Gender.valueOf(request.getGender().toUpperCase()))
                .fragranceFamily(request.getFragranceFamily())
                .topNotes(request.getTopNotes())
                .middleNotes(request.getMiddleNotes())
                .baseNotes(request.getBaseNotes())
                .isFeatured(request.getIsFeatured())
                .isBestSeller(request.getIsBestSeller())
                .isNewArrival(request.getIsNewArrival())
                .isLuxury(request.getIsLuxury())
                .isActive(request.getIsActive())
                .build();

        product = productRepository.save(product);

        // Create inventory
        Inventory inventory = Inventory.builder()
                .product(product)
                .quantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0)
                .lowStockThreshold(request.getLowStockThreshold() != null ? request.getLowStockThreshold() : 10)
                .build();
        inventoryRepository.save(inventory);

        // Upload images
        if (images != null && !images.isEmpty()) {
            for (int i = 0; i < images.size(); i++) {
                MultipartFile imgFile = images.get(i);
                if (!imgFile.isEmpty()) {
                    var uploadResult = cloudinaryService.uploadImage(imgFile, "products");
                    ProductImage productImage = ProductImage.builder()
                            .product(product)
                            .imageUrl(uploadResult.get("url"))
                            .publicId(uploadResult.get("publicId"))
                            .isPrimary(i == 0)
                            .sortOrder(i)
                            .build();
                    productImageRepository.save(productImage);
                }
            }
        }

        return ProductResponse.from(productRepository.findById(product.getId()).orElse(product));
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request, List<MultipartFile> newImages) throws Exception {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (request.getCategoryId() != null) {
            categoryRepository.findById(request.getCategoryId()).ifPresent(product::setCategory);
        }

        product.setName(request.getName());
        product.setBrand(request.getBrand());
        product.setDescription(request.getDescription());
        product.setOriginalPrice(request.getOriginalPrice());
        product.setDiscountPrice(request.getDiscountPrice());
        product.setGender(Product.Gender.valueOf(request.getGender().toUpperCase()));
        product.setFragranceFamily(request.getFragranceFamily());
        product.setTopNotes(request.getTopNotes());
        product.setMiddleNotes(request.getMiddleNotes());
        product.setBaseNotes(request.getBaseNotes());
        product.setIsFeatured(request.getIsFeatured());
        product.setIsBestSeller(request.getIsBestSeller());
        product.setIsNewArrival(request.getIsNewArrival());
        product.setIsLuxury(request.getIsLuxury());
        product.setIsActive(request.getIsActive());

        // Update inventory
        Inventory inventory = inventoryRepository.findByProductId(id).orElse(Inventory.builder().product(product).build());
        if (request.getStockQuantity() != null) inventory.setQuantity(request.getStockQuantity());
        if (request.getLowStockThreshold() != null) inventory.setLowStockThreshold(request.getLowStockThreshold());
        inventoryRepository.save(inventory);

        // Upload new images if provided
        if (newImages != null && !newImages.isEmpty()) {
            int existingCount = productImageRepository.findByProductIdOrderBySortOrderAsc(id).size();
            for (int i = 0; i < newImages.size(); i++) {
                MultipartFile imgFile = newImages.get(i);
                if (!imgFile.isEmpty()) {
                    var uploadResult = cloudinaryService.uploadImage(imgFile, "products");
                    ProductImage productImage = ProductImage.builder()
                            .product(product)
                            .imageUrl(uploadResult.get("url"))
                            .publicId(uploadResult.get("publicId"))
                            .isPrimary(existingCount == 0 && i == 0)
                            .sortOrder(existingCount + i)
                            .build();
                    productImageRepository.save(productImage);
                }
            }
        }

        return ProductResponse.from(productRepository.save(product));
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Delete cloudinary images
        product.getImages().forEach(img -> {
            try {
                cloudinaryService.deleteImage(img.getPublicId());
            } catch (Exception e) {
                // Log but continue
            }
        });

        productRepository.delete(product);
    }

    @Transactional
    public void deleteProductImage(Long imageId) throws Exception {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));
        cloudinaryService.deleteImage(image.getPublicId());
        productImageRepository.delete(image);
    }

    public List<ProductResponse> getLowStockProducts(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return productRepository.findLowStockProducts(pageable)
                .stream().map(ProductResponse::from).collect(Collectors.toList());
    }
}
