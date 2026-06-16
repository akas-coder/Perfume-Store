package com.perfume.controller;

import com.perfume.dto.request.AddressRequest;
import com.perfume.dto.response.ApiResponse;
import com.perfume.model.Address;
import com.perfume.service.UserService;
import com.perfume.util.SessionUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<?>> getProfile(HttpServletRequest request) {
        Long userId = SessionUtil.getCurrentUserId(request);
        return ResponseEntity.ok(ApiResponse.success(userService.getProfile(userId)));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<?>> updateProfile(
            @RequestBody Map<String, String> updates, HttpServletRequest request) {
        Long userId = SessionUtil.getCurrentUserId(request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", userService.updateProfile(userId, updates)));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<?>> changePassword(
            @RequestBody Map<String, String> body, HttpServletRequest request) {
        try {
            Long userId = SessionUtil.getCurrentUserId(request);
            userService.changePassword(userId, body.get("currentPassword"), body.get("newPassword"));
            return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/addresses")
    public ResponseEntity<ApiResponse<List<Address>>> getAddresses(HttpServletRequest request) {
        Long userId = SessionUtil.getCurrentUserId(request);
        return ResponseEntity.ok(ApiResponse.success(userService.getAddresses(userId)));
    }

    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse<Address>> addAddress(
            @Valid @RequestBody AddressRequest addressRequest, HttpServletRequest request) {
        try {
            Long userId = SessionUtil.getCurrentUserId(request);
            return ResponseEntity.ok(ApiResponse.success("Address added", userService.addAddress(userId, addressRequest)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<Address>> updateAddress(
            @PathVariable Long id, @Valid @RequestBody AddressRequest addressRequest, HttpServletRequest request) {
        try {
            Long userId = SessionUtil.getCurrentUserId(request);
            return ResponseEntity.ok(ApiResponse.success("Address updated", userService.updateAddress(userId, id, addressRequest)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<?>> deleteAddress(@PathVariable Long id, HttpServletRequest request) {
        try {
            Long userId = SessionUtil.getCurrentUserId(request);
            userService.deleteAddress(userId, id);
            return ResponseEntity.ok(ApiResponse.success("Address deleted", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
