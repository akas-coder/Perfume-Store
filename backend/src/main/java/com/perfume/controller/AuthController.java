package com.perfume.controller;

import com.perfume.dto.request.LoginRequest;
import com.perfume.dto.request.RegisterRequest;
import com.perfume.dto.response.ApiResponse;
import com.perfume.dto.response.AuthResponse;
import com.perfume.dto.response.UserResponse;
import com.perfume.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse authResponse = authService.register(request);
            return ResponseEntity.ok(ApiResponse.success("Registration successful", authResponse));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse authResponse = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        authService.logout();
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(HttpServletRequest request) {
        UserResponse user = authService.getCurrentUser(request);
        if (user == null) {
            return ResponseEntity.ok(ApiResponse.<UserResponse>builder()
                    .success(false).message("Not authenticated").build());
        }
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}
