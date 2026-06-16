package com.perfume.controller;

import com.perfume.dto.request.CartItemRequest;
import com.perfume.dto.response.ApiResponse;
import com.perfume.model.Cart;
import com.perfume.service.CartService;
import com.perfume.util.SessionUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired private CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<Cart>> getCart(HttpServletRequest request) {
        Long userId = SessionUtil.getCurrentUserId(request);
        return ResponseEntity.ok(ApiResponse.success(cartService.getCart(userId)));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<Cart>> addItem(
            @Valid @RequestBody CartItemRequest itemRequest, HttpServletRequest request) {
        try {
            Long userId = SessionUtil.getCurrentUserId(request);
            Cart cart = cartService.addItem(userId, itemRequest.getProductId(),
                    itemRequest.getQuantity(), itemRequest.getGiftPackaging());
            return ResponseEntity.ok(ApiResponse.success("Item added to cart", cart));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<Cart>> updateItem(
            @PathVariable Long itemId, @RequestBody Map<String, Integer> body, HttpServletRequest request) {
        try {
            Long userId = SessionUtil.getCurrentUserId(request);
            Cart cart = cartService.updateItem(userId, itemId, body.getOrDefault("quantity", 1));
            return ResponseEntity.ok(ApiResponse.success("Cart updated", cart));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<Cart>> removeItem(
            @PathVariable Long itemId, HttpServletRequest request) {
        try {
            Long userId = SessionUtil.getCurrentUserId(request);
            Cart cart = cartService.removeItem(userId, itemId);
            return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cart));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/apply-coupon")
    public ResponseEntity<ApiResponse<Cart>> applyCoupon(
            @RequestBody Map<String, String> body, HttpServletRequest request) {
        try {
            Long userId = SessionUtil.getCurrentUserId(request);
            Cart cart = cartService.applyCoupon(userId, body.get("couponCode"));
            return ResponseEntity.ok(ApiResponse.success("Coupon applied", cart));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/coupon")
    public ResponseEntity<ApiResponse<Cart>> removeCoupon(HttpServletRequest request) {
        Long userId = SessionUtil.getCurrentUserId(request);
        Cart cart = cartService.removeCoupon(userId);
        return ResponseEntity.ok(ApiResponse.success("Coupon removed", cart));
    }
}
