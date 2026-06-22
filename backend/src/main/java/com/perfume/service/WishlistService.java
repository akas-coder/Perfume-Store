package com.perfume.service;

import com.perfume.model.*;
import com.perfume.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WishlistService {

    @Autowired private WishlistRepository wishlistRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private CartService cartService;

    @Transactional(readOnly = true)
    public List<Wishlist> getWishlist(Long userId) {
        List<Wishlist> wishlistItems = wishlistRepository.findByUserIdOrderByAddedAtDesc(userId);
        wishlistItems.forEach(item -> {
            if (item.getProduct() != null && item.getProduct().getImages() != null) {
                item.getProduct().getImages().size();
            }
        });
        return wishlistItems;
    }

    @Transactional
    public Wishlist addToWishlist(Long userId, Long productId) {
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new RuntimeException("Product already in wishlist");
        }

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(productId)
                .filter(p -> p.getIsActive())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getImages() != null) {
            product.getImages().size();
        }

        Wishlist wishlist = Wishlist.builder().user(user).product(product).build();
        return wishlistRepository.save(wishlist);
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        if (!wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new RuntimeException("Product not in wishlist");
        }
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }

    @Transactional
    public void moveToCart(Long userId, Long productId) {
        cartService.addItem(userId, productId, 1, "NORMAL");
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);
    }

    public boolean isInWishlist(Long userId, Long productId) {
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }
}
