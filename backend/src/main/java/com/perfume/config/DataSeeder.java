package com.perfume.config;

import com.perfume.model.*;
import com.perfume.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.math.BigDecimal;


@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private AdminRepository adminRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private CouponRepository couponRepository;


    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) {
        seedAdmin();
        seedCategories();
        seedCoupons();
    }

    private void seedAdmin() {
        Admin admin = adminRepository.findByEmail("admin@perfume.com").orElse(null);
        if (admin == null) {
            admin = Admin.builder()
                    .name("Super Admin")
                    .email("admin@perfume.com")
                    .password(encoder.encode("Admin@123"))
                    .build();
            adminRepository.save(admin);
            System.out.println("✅ Admin seeded: admin@perfume.com / Admin@123");
        } else {
            admin.setPassword(encoder.encode("Admin@123"));
            adminRepository.save(admin);
            System.out.println("✅ Admin password reset to: Admin@123");
        }
    }

    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            String[][] cats = {
                {"Men's Perfumes", "mens-perfumes", "Premium fragrances crafted for men"},
                {"Women's Perfumes", "womens-perfumes", "Elegant fragrances for women"},
                {"Unisex Perfumes", "unisex-perfumes", "Fragrances for everyone"},
                {"Luxury Collection", "luxury-collection", "Exclusive ultra-luxury fragrances"},
                {"Gift Sets", "gift-sets", "Curated perfume gift sets"},
                {"Summer Collection", "summer-collection", "Light and fresh summer scents"},
                {"Winter Collection", "winter-collection", "Warm and cozy winter fragrances"}
            };
            for (String[] cat : cats) {
                Category category = Category.builder()
                        .name(cat[0]).slug(cat[1]).description(cat[2]).isActive(true).build();
                categoryRepository.save(category);
            }
            System.out.println("✅ Categories seeded");
        }
    }

    private void seedCoupons() {
        if (couponRepository.count() == 0) {
            Coupon c1 = Coupon.builder()
                    .code("WELCOME10").type(Coupon.CouponType.PERCENTAGE)
                    .discountValue(new BigDecimal("10")).minOrderAmount(new BigDecimal("999"))
                    .maxDiscountAmount(new BigDecimal("500")).usageLimit(1000)
                    .isActive(true).validUntil(LocalDate.now().plusYears(1)).build();
            couponRepository.save(c1);

            Coupon c2 = Coupon.builder()
                    .code("FLAT500").type(Coupon.CouponType.FIXED)
                    .discountValue(new BigDecimal("500")).minOrderAmount(new BigDecimal("2999"))
                    .isActive(true).validUntil(LocalDate.now().plusMonths(6)).build();
            couponRepository.save(c2);

            Coupon c3 = Coupon.builder()
                    .code("FIRST20").type(Coupon.CouponType.FIRST_ORDER)
                    .discountValue(new BigDecimal("20")).minOrderAmount(new BigDecimal("1499"))
                    .maxDiscountAmount(new BigDecimal("800")).isActive(true)
                    .validUntil(LocalDate.now().plusYears(1)).build();
            couponRepository.save(c3);

            System.out.println("✅ Coupons seeded: WELCOME10, FLAT500, FIRST20");
        }
    }

}
