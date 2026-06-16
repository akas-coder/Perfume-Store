package com.perfume.controller.admin;

import com.perfume.dto.response.ApiResponse;
import com.perfume.model.Inventory;
import com.perfume.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/inventory")
public class AdminInventoryController {

    @Autowired private InventoryRepository inventoryRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Inventory>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(inventoryRepository.findAll()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Inventory>> update(
            @PathVariable Long id, @RequestBody Map<String, Integer> body) {
        try {
            Inventory inventory = inventoryRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Inventory not found"));
            if (body.containsKey("quantity")) inventory.setQuantity(body.get("quantity"));
            if (body.containsKey("lowStockThreshold")) inventory.setLowStockThreshold(body.get("lowStockThreshold"));
            return ResponseEntity.ok(ApiResponse.success("Stock updated", inventoryRepository.save(inventory)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
