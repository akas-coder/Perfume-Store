package com.perfume.controller;

import com.perfume.dto.response.ApiResponse;
import com.perfume.model.Wishlist;
import com.perfume.service.WishlistService;
import com.perfume.util.SessionUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired private WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Wishlist>>> getWishlist(HttpServletRequest request) {
        Long userId = SessionUtil.getCurrentUserId(request);
        return ResponseEntity.ok(ApiResponse.success(wishlistService.getWishlist(userId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Wishlist>> add(
            @RequestBody Map<String, Long> body, HttpServletRequest request) {
        try {
            Long userId = SessionUtil.getCurrentUserId(request);
            Wishlist wishlist = wishlistService.addToWishlist(userId, body.get("productId"));
            return ResponseEntity.ok(ApiResponse.success("Added to wishlist", wishlist));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<?>> remove(@PathVariable Long productId, HttpServletRequest request) {
        try {
            Long userId = SessionUtil.getCurrentUserId(request);
            wishlistService.removeFromWishlist(userId, productId);
            return ResponseEntity.ok(ApiResponse.success("Removed from wishlist", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{productId}/move-to-cart")
    public ResponseEntity<ApiResponse<?>> moveToCart(@PathVariable Long productId, HttpServletRequest request) {
        try {
            Long userId = SessionUtil.getCurrentUserId(request);
            wishlistService.moveToCart(userId, productId);
            return ResponseEntity.ok(ApiResponse.success("Moved to cart", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{productId}/check")
    public ResponseEntity<ApiResponse<Boolean>> check(@PathVariable Long productId, HttpServletRequest request) {
        Long userId = SessionUtil.getCurrentUserId(request);
        return ResponseEntity.ok(ApiResponse.success(wishlistService.isInWishlist(userId, productId)));
    }
}
