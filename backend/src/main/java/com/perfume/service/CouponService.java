package com.perfume.service;

import com.perfume.dto.request.CouponRequest;
import com.perfume.model.Coupon;
import com.perfume.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CouponService {

    @Autowired private CouponRepository couponRepository;

    public List<Coupon> getAll() {
        return couponRepository.findAll();
    }

    public Coupon validate(String code) {
        Coupon coupon = couponRepository.findByCodeAndIsActiveTrue(code)
                .orElseThrow(() -> new RuntimeException("Invalid or expired coupon code"));
        if (!coupon.isValid()) {
            throw new RuntimeException("Coupon has expired or reached its usage limit");
        }
        return coupon;
    }

    @Transactional
    public Coupon create(CouponRequest request) {
        if (couponRepository.existsByCode(request.getCode().toUpperCase())) {
            throw new RuntimeException("Coupon code already exists");
        }
        Coupon coupon = Coupon.builder()
                .code(request.getCode().toUpperCase())
                .type(Coupon.CouponType.valueOf(request.getType().toUpperCase()))
                .discountValue(request.getDiscountValue())
                .minOrderAmount(request.getMinOrderAmount())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .usageLimit(request.getUsageLimit())
                .isActive(request.getIsActive())
                .validFrom(request.getValidFrom())
                .validUntil(request.getValidUntil())
                .build();
        return couponRepository.save(coupon);
    }

    @Transactional
    public Coupon update(Long id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id).orElseThrow(() -> new RuntimeException("Coupon not found"));
        coupon.setDiscountValue(request.getDiscountValue());
        coupon.setMinOrderAmount(request.getMinOrderAmount());
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setUsageLimit(request.getUsageLimit());
        coupon.setIsActive(request.getIsActive());
        coupon.setValidFrom(request.getValidFrom());
        coupon.setValidUntil(request.getValidUntil());
        return couponRepository.save(coupon);
    }

    @Transactional
    public void delete(Long id) {
        couponRepository.deleteById(id);
    }
}
