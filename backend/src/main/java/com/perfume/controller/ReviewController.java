package com.perfume.controller;

import com.perfume.dto.request.ReviewRequest;
import com.perfume.dto.response.ApiResponse;
import com.perfume.model.Review;
import com.perfume.service.ReviewService;
import com.perfume.util.SessionUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ReviewController {

    @Autowired private ReviewService reviewService;

    @GetMapping("/products/{productId}/reviews")
    public ResponseEntity<ApiResponse<Page<Review>>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getProductReviews(productId, page, size)));
    }

    @PostMapping("/products/{productId}/reviews")
    public ResponseEntity<ApiResponse<Review>> addReview(
            @PathVariable Long productId,
            @Valid @RequestBody ReviewRequest request,
            HttpServletRequest httpRequest) {
        try {
            Long userId = SessionUtil.getCurrentUserId(httpRequest);
            return ResponseEntity.ok(ApiResponse.success("Review added", reviewService.addReview(userId, productId, request)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/reviews/{reviewId}")
    public ResponseEntity<ApiResponse<Review>> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewRequest request,
            HttpServletRequest httpRequest) {
        try {
            Long userId = SessionUtil.getCurrentUserId(httpRequest);
            return ResponseEntity.ok(ApiResponse.success("Review updated", reviewService.updateReview(userId, reviewId, request)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<ApiResponse<?>> deleteReview(
            @PathVariable Long reviewId, HttpServletRequest httpRequest) {
        try {
            Long userId = SessionUtil.getCurrentUserId(httpRequest);
            reviewService.deleteReview(userId, reviewId);
            return ResponseEntity.ok(ApiResponse.success("Review deleted", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
