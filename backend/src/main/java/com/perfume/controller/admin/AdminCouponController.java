package com.perfume.controller.admin;

import com.perfume.dto.request.CouponRequest;
import com.perfume.dto.response.ApiResponse;
import com.perfume.model.Coupon;
import com.perfume.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/coupons")
public class AdminCouponController {

    @Autowired private CouponService couponService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Coupon>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(couponService.getAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Coupon>> create(@Valid @RequestBody CouponRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Coupon created", couponService.create(request)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Coupon>> update(@PathVariable Long id, @Valid @RequestBody CouponRequest request) {
        try {
            return ResponseEntity.ok(ApiResponse.success("Coupon updated", couponService.update(id, request)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        couponService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deleted", null));
    }
}
