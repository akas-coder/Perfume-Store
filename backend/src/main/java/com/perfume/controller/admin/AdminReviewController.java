package com.perfume.controller.admin;

import com.perfume.dto.response.ApiResponse;
import com.perfume.model.Review;
import com.perfume.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reviews")
public class AdminReviewController {

    @Autowired private ReviewService reviewService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Review>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getAllReviews(page, size)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        try {
            reviewService.adminDeleteReview(id);
            return ResponseEntity.ok(ApiResponse.success("Review deleted", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
