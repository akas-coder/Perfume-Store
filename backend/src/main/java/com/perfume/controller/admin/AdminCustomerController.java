package com.perfume.controller.admin;

import com.perfume.dto.response.ApiResponse;
import com.perfume.dto.response.UserResponse;
import com.perfume.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/customers")
public class AdminCustomerController {

    @Autowired private DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        List<UserResponse> users = dashboardService.getAllCustomers(page, size)
                .stream().map(UserResponse::from).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PutMapping("/{id}/block")
    public ResponseEntity<ApiResponse<?>> block(@PathVariable Long id) {
        dashboardService.blockUser(id);
        return ResponseEntity.ok(ApiResponse.success("Customer blocked", null));
    }

    @PutMapping("/{id}/unblock")
    public ResponseEntity<ApiResponse<?>> unblock(@PathVariable Long id) {
        dashboardService.unblockUser(id);
        return ResponseEntity.ok(ApiResponse.success("Customer unblocked", null));
    }
}
