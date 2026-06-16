package com.perfume.config;

import com.perfume.model.*;
import com.perfume.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private AdminRepository adminRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private InventoryRepository inventoryRepository;
    @Autowired private ProductImageRepository productImageRepository;
    @Autowired private CouponRepository couponRepository;
    @Autowired private BannerRepository bannerRepository;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) {
        //seedAdmin();
        seedCategories();
        seedProducts();
        seedCoupons();
        seedBanners();
    }

    // private void seedAdmin() {
    //     Admin admin = adminRepository.findByEmail("admin@perfume.com").orElse(null);
    //     if (admin == null) {
    //         admin = Admin.builder()
    //                 .name("Super Admin")
    //                 .email("admin@perfume.com")
    //                 .password(encoder.encode("Admin@123"))
    //                 .build();
    //         adminRepository.save(admin);
    //         System.out.println("✅ Admin seeded: admin@perfume.com / Admin@123");
    //     } else {
    //         admin.setPassword(encoder.encode("Admin@123"));
    //         adminRepository.save(admin);
    //         System.out.println("✅ Admin password reset to: Admin@123");
    //     }
    // }

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

    private void seedProducts() {
        if (productRepository.count() == 0) {
            Category mensCat = categoryRepository.findBySlug("mens-perfumes").orElse(null);
            Category womensCat = categoryRepository.findBySlug("womens-perfumes").orElse(null);
            Category luxuryCat = categoryRepository.findBySlug("luxury-collection").orElse(null);

            // Men's Perfume 1
            Product p1 = Product.builder()
                    .name("Black Oud Intense").brand("Maison Noir")
                    .description("A deep, smoky oud fragrance with a luxurious dark aura. Perfect for evening wear.")
                    .originalPrice(new BigDecimal("4999")).discountPrice(new BigDecimal("3499"))
                    .category(mensCat).gender(Product.Gender.MEN)
                    .fragranceFamily("Oriental").topNotes("Bergamot, Black Pepper")
                    .middleNotes("Rose, Oud Wood").baseNotes("Sandalwood, Musk, Amber")
                    .isFeatured(true).isBestSeller(true).isNewArrival(false).isLuxury(true).isActive(true)
                    .build();
            p1 = productRepository.save(p1);
            saveInventory(p1, 50);
            saveImage(p1, "https://images.unsplash.com/photo-1541643600914-78b084683702?w=600", true);

            // Women's Perfume 1
            Product p2 = Product.builder()
                    .name("Rose Élégance").brand("Fleur de Paris")
                    .description("A timeless floral fragrance inspired by the gardens of Paris. Feminine and sophisticated.")
                    .originalPrice(new BigDecimal("3599")).discountPrice(new BigDecimal("2799"))
                    .category(womensCat).gender(Product.Gender.WOMEN)
                    .fragranceFamily("Floral").topNotes("Pink Rose, Lychee")
                    .middleNotes("Peony, Jasmine, Lily").baseNotes("Musk, Cedarwood, Vanilla")
                    .isFeatured(true).isBestSeller(true).isNewArrival(true).isLuxury(false).isActive(true)
                    .build();
            p2 = productRepository.save(p2);
            saveInventory(p2, 75);
            saveImage(p2, "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=600", true);

            // Luxury Perfume
            Product p3 = Product.builder()
                    .name("Soleil d'Or").brand("Maison Dorée")
                    .description("The pinnacle of luxury perfumery. A radiant golden fragrance that commands attention.")
                    .originalPrice(new BigDecimal("12999")).discountPrice(new BigDecimal("9999"))
                    .category(luxuryCat).gender(Product.Gender.UNISEX)
                    .fragranceFamily("Gourmand").topNotes("Saffron, Cardamom")
                    .middleNotes("Iris, Jasmine Sambac, Rose Absolute").baseNotes("Amberwood, Patchouli, Vanilla Bean")
                    .isFeatured(true).isBestSeller(false).isNewArrival(false).isLuxury(true).isActive(true)
                    .build();
            p3 = productRepository.save(p3);
            saveInventory(p3, 20);
            saveImage(p3, "https://images.unsplash.com/photo-1588514912908-6b02438d1e74?w=600", true);

            // Men's Perfume 2
            Product p4 = Product.builder()
                    .name("Aqua Virilis").brand("Blu Ocean")
                    .description("A fresh, aquatic fragrance for the modern man. Clean, invigorating, timeless.")
                    .originalPrice(new BigDecimal("2499")).discountPrice(new BigDecimal("1999"))
                    .category(mensCat).gender(Product.Gender.MEN)
                    .fragranceFamily("Aquatic").topNotes("Sea Breeze, Lemon, Bergamot")
                    .middleNotes("Sage, Vetiver").baseNotes("White Musk, Cedarwood")
                    .isFeatured(false).isBestSeller(true).isNewArrival(true).isLuxury(false).isActive(true)
                    .build();
            p4 = productRepository.save(p4);
            saveInventory(p4, 100);
            saveImage(p4, "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600", true);

            // Women's Perfume 2
            Product p5 = Product.builder()
                    .name("Velvet Oud Rose").brand("Arabian Nights")
                    .description("A captivating blend of velvety rose and precious oud. The scent of a thousand nights.")
                    .originalPrice(new BigDecimal("5999")).discountPrice(new BigDecimal("4499"))
                    .category(womensCat).gender(Product.Gender.WOMEN)
                    .fragranceFamily("Oriental Floral").topNotes("Damask Rose, Raspberry")
                    .middleNotes("Oud, Bulgarian Rose, Ylang Ylang").baseNotes("Amber, Musk, Sandalwood")
                    .isFeatured(true).isBestSeller(false).isNewArrival(true).isLuxury(true).isActive(true)
                    .build();
            p5 = productRepository.save(p5);
            saveInventory(p5, 35);
            saveImage(p5, "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600", true);

            System.out.println("✅ Sample products seeded");
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

    private void seedBanners() {
        if (bannerRepository.count() == 0) {
            Banner b1 = Banner.builder()
                    .title("Discover Your Signature Scent")
                    .subtitle("Explore our curated collection of luxury fragrances from around the world")
                    .imageUrl("https://images.unsplash.com/photo-1541643600914-78b084683702?w=1400")
                    .linkUrl("/products").buttonText("Shop Now").sortOrder(1).isActive(true).build();
            bannerRepository.save(b1);

            Banner b2 = Banner.builder()
                    .title("Luxury Collection 2024")
                    .subtitle("Experience the rarest ingredients and master perfumers' finest creations")
                    .imageUrl("https://images.unsplash.com/photo-1588514912908-6b02438d1e74?w=1400")
                    .linkUrl("/products?isLuxury=true").buttonText("Explore Luxury")
                    .sortOrder(2).isActive(true).build();
            bannerRepository.save(b2);

            System.out.println("✅ Banners seeded");
        }
    }

    private void saveInventory(Product product, int qty) {
        Inventory inv = Inventory.builder().product(product).quantity(qty).lowStockThreshold(10).build();
        inventoryRepository.save(inv);
    }

    private void saveImage(Product product, String url, boolean isPrimary) {
        ProductImage img = ProductImage.builder()
                .product(product).imageUrl(url).isPrimary(isPrimary).sortOrder(0).build();
        productImageRepository.save(img);
    }
}
