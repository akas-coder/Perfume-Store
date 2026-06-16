package com.perfume.controller;

import com.perfume.dto.response.ApiResponse;
import com.perfume.model.Category;
import com.perfume.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired private CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getAllActive()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(ApiResponse.success(categoryService.getById(id)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
