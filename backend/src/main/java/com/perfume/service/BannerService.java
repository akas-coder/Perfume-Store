package com.perfume.service;

import com.perfume.model.Banner;
import com.perfume.repository.BannerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class BannerService {

    @Autowired private BannerRepository bannerRepository;
    @Autowired private CloudinaryService cloudinaryService;

    public List<Banner> getActiveBanners() {
        return bannerRepository.findByIsActiveTrueOrderBySortOrderAsc();
    }

    public List<Banner> getAllBanners() {
        return bannerRepository.findAllByOrderBySortOrderAsc();
    }

    @Transactional
    public Banner create(String title, String subtitle, String linkUrl, String buttonText,
                         Integer sortOrder, MultipartFile image) throws Exception {
        String imageUrl = "";
        String publicId = "";

        if (image != null && !image.isEmpty()) {
            var result = cloudinaryService.uploadImage(image, "banners");
            imageUrl = result.get("url");
            publicId = result.get("publicId");
        }

        Banner banner = Banner.builder()
                .title(title)
                .subtitle(subtitle)
                .imageUrl(imageUrl)
                .publicId(publicId)
                .linkUrl(linkUrl)
                .buttonText(buttonText)
                .sortOrder(sortOrder != null ? sortOrder : 0)
                .isActive(true)
                .build();

        return bannerRepository.save(banner);
    }

    @Transactional
    public Banner update(Long id, String title, String subtitle, String linkUrl,
                         String buttonText, Integer sortOrder, Boolean isActive, MultipartFile image) throws Exception {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));

        if (title != null) banner.setTitle(title);
        if (subtitle != null) banner.setSubtitle(subtitle);
        if (linkUrl != null) banner.setLinkUrl(linkUrl);
        if (buttonText != null) banner.setButtonText(buttonText);
        if (sortOrder != null) banner.setSortOrder(sortOrder);
        if (isActive != null) banner.setIsActive(isActive);

        if (image != null && !image.isEmpty()) {
            if (banner.getPublicId() != null && !banner.getPublicId().isEmpty()) {
                cloudinaryService.deleteImage(banner.getPublicId());
            }
            var result = cloudinaryService.uploadImage(image, "banners");
            banner.setImageUrl(result.get("url"));
            banner.setPublicId(result.get("publicId"));
        }

        return bannerRepository.save(banner);
    }

    @Transactional
    public void delete(Long id) throws Exception {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));
        if (banner.getPublicId() != null && !banner.getPublicId().isEmpty()) {
            cloudinaryService.deleteImage(banner.getPublicId());
        }
        bannerRepository.delete(banner);
    }
}
