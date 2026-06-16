package com.perfume.controller.admin;

import com.perfume.dto.request.LoginRequest;
import com.perfume.dto.response.ApiResponse;
import com.perfume.model.Admin;
import com.perfume.service.AuthService;
import com.perfume.util.SessionUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    @Autowired private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(
            @Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        try {
            Admin admin = authService.adminLogin(request, httpRequest);
            return ResponseEntity.ok(ApiResponse.success("Admin login successful",
                    Map.of("id", admin.getId(), "name", admin.getName(), "email", admin.getEmail())));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<?>> logout(HttpServletRequest request) {
        authService.logout(request);
        return ResponseEntity.ok(ApiResponse.success("Logged out", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<?>> me(HttpServletRequest request) {
        Long adminId = SessionUtil.getCurrentAdminId(request);
        if (adminId == null) {
            return ResponseEntity.ok(ApiResponse.<Object>builder().success(false).message("Not authenticated").build());
        }
        return ResponseEntity.ok(ApiResponse.success(Map.of("id", adminId, "authenticated", true)));
    }
}
