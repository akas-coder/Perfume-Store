package com.perfume.controller;

import com.perfume.dto.response.ApiResponse;
import com.perfume.dto.response.ProductResponse;
import com.perfume.service.ProductService;
import com.perfume.util.SessionUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired private ProductService productService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String fragranceFamily,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Double minRating) {
        Page<ProductResponse> products = productService.getAllProducts(
                page, size, sortBy, sortDir, categoryId, gender, fragranceFamily, minPrice, maxPrice, minRating);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(ApiResponse.success(productService.searchProducts(q, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ApiResponse.success(productService.getProductById(id)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> featured() {
        return ResponseEntity.ok(ApiResponse.success(productService.getFeaturedProducts()));
    }

    @GetMapping("/best-sellers")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> bestSellers() {
        return ResponseEntity.ok(ApiResponse.success(productService.getBestSellers()));
    }

    @GetMapping("/new-arrivals")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> newArrivals() {
        return ResponseEntity.ok(ApiResponse.success(productService.getNewArrivals()));
    }

    @GetMapping("/luxury")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> luxury() {
        return ResponseEntity.ok(ApiResponse.success(productService.getLuxuryCollection()));
    }

    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> trending() {
        return ResponseEntity.ok(ApiResponse.success(productService.getTrending()));
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> related(
            @PathVariable Long id, @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(ApiResponse.success(productService.getRelatedProducts(id, limit)));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> recommendations(
            @RequestParam(defaultValue = "UNISEX") String gender,
            @RequestParam(defaultValue = "Floral") String fragranceFamily,
            @RequestParam(required = false) BigDecimal maxBudget) {
        return ResponseEntity.ok(ApiResponse.success(
                productService.getRecommendations(gender, fragranceFamily, maxBudget)));
    }
}
