package com.perfume.controller.admin;

import com.perfume.dto.response.ApiResponse;
import com.perfume.model.Banner;
import com.perfume.service.BannerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/banners")
public class AdminBannerController {

    @Autowired private BannerService bannerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Banner>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(bannerService.getAllBanners()));
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<Banner>> create(
            @RequestParam String title,
            @RequestParam(required = false) String subtitle,
            @RequestParam(required = false) String linkUrl,
            @RequestParam(required = false) String buttonText,
            @RequestParam(defaultValue = "0") Integer sortOrder,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            Banner banner = bannerService.create(title, subtitle, linkUrl, buttonText, sortOrder, image);
            return ResponseEntity.ok(ApiResponse.success("Banner created", banner));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<ApiResponse<Banner>> update(
            @PathVariable Long id,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String subtitle,
            @RequestParam(required = false) String linkUrl,
            @RequestParam(required = false) String buttonText,
            @RequestParam(required = false) Integer sortOrder,
            @RequestParam(required = false) Boolean isActive,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            Banner banner = bannerService.update(id, title, subtitle, linkUrl, buttonText, sortOrder, isActive, image);
            return ResponseEntity.ok(ApiResponse.success("Banner updated", banner));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        try {
            bannerService.delete(id);
            return ResponseEntity.ok(ApiResponse.success("Banner deleted", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
