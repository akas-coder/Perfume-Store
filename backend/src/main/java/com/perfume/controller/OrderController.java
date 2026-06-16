package com.perfume.controller;

import com.perfume.dto.request.OrderRequest;
import com.perfume.dto.response.ApiResponse;
import com.perfume.dto.response.OrderResponse;
import com.perfume.service.OrderService;
import com.perfume.util.SessionUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired private OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @Valid @RequestBody OrderRequest request, HttpServletRequest httpRequest) {
        try {
            Long userId = SessionUtil.getCurrentUserId(httpRequest);
            return ResponseEntity.ok(ApiResponse.success("Order placed successfully",
                    orderService.placeOrder(userId, request)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getUserOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        Long userId = SessionUtil.getCurrentUserId(request);
        return ResponseEntity.ok(ApiResponse.success(orderService.getUserOrders(userId, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(
            @PathVariable Long id, HttpServletRequest request) {
        try {
            Long userId = SessionUtil.getCurrentUserId(request);
            return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(userId, id)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Long id, HttpServletRequest request) {
        try {
            Long userId = SessionUtil.getCurrentUserId(request);
            return ResponseEntity.ok(ApiResponse.success("Order cancelled", orderService.cancelOrder(userId, id)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
