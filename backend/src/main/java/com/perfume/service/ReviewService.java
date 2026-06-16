package com.perfume.service;

import com.perfume.dto.request.ReviewRequest;
import com.perfume.model.*;
import com.perfume.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class ReviewService {

    @Autowired private ReviewRepository reviewRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private OrderItemRepository orderItemRepository;

    public Page<Review> getProductReviews(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
    }

    @Transactional
    public Review addReview(Long userId, Long productId, ReviewRequest request) {
        if (reviewRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new RuntimeException("You have already reviewed this product");
        }

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        boolean verifiedPurchase = orderItemRepository.existsByOrderUserIdAndProductId(userId, productId);

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .title(request.getTitle())
                .body(request.getBody())
                .isVerifiedPurchase(verifiedPurchase)
                .build();
        review = reviewRepository.save(review);

        updateProductRating(productId);
        return review;
    }

    @Transactional
    public Review updateReview(Long userId, Long reviewId, ReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .filter(r -> r.getUser().getId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Review not found"));

        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setBody(request.getBody());
        review = reviewRepository.save(review);

        updateProductRating(review.getProduct().getId());
        return review;
    }

    @Transactional
    public void deleteReview(Long userId, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .filter(r -> r.getUser().getId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Review not found"));
        Long productId = review.getProduct().getId();
        reviewRepository.delete(review);
        updateProductRating(productId);
    }

    @Transactional
    public void adminDeleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        Long productId = review.getProduct().getId();
        reviewRepository.delete(review);
        updateProductRating(productId);
    }

    private void updateProductRating(Long productId) {
        Double avg = reviewRepository.getAverageRating(productId);
        long count = reviewRepository.countByProductId(productId);
        productRepository.findById(productId).ifPresent(product -> {
            product.setAvgRating(avg != null ? BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
            product.setReviewCount((int) count);
            productRepository.save(product);
        });
    }

    public Page<Review> getAllReviews(int page, int size) {
        return reviewRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }
}
