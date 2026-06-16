package com.perfume.service;

import com.perfume.model.*;
import com.perfume.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CartService {

    @Autowired private CartRepository cartRepository;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private InventoryRepository inventoryRepository;
    @Autowired private CouponRepository couponRepository;

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("999");
    private static final BigDecimal SHIPPING_CHARGE = new BigDecimal("99");
    private static final BigDecimal GIFT_PACKAGING_CHARGE = new BigDecimal("99");

    public Cart getCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // Should not happen after registration, but just in case
                    throw new RuntimeException("Cart not found");
                });
    }

    @Transactional
    public Cart addItem(Long userId, Long productId, int quantity, String giftPackaging) {
        Cart cart = getCart(userId);
        Product product = productRepository.findById(productId)
                .filter(p -> p.getIsActive())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("Product inventory not found"));

        if (inventory.getQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + inventory.getQuantity());
        }

        CartItem.GiftPackaging gp = CartItem.GiftPackaging.NORMAL;
        try { gp = CartItem.GiftPackaging.valueOf(giftPackaging.toUpperCase()); } catch (Exception ignored) {}

        CartItem existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId).orElse(null);
        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            existingItem.setGiftPackaging(gp);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantity)
                    .giftPackaging(gp)
                    .build();
            cartItemRepository.save(newItem);
        }

        return cartRepository.findByUserId(userId).orElse(cart);
    }

    @Transactional
    public Cart updateItem(Long userId, Long itemId, int quantity) {
        Cart cart = getCart(userId);
        CartItem item = cartItemRepository.findById(itemId)
                .filter(i -> i.getCart().getId().equals(cart.getId()))
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            Inventory inventory = inventoryRepository.findByProductId(item.getProduct().getId()).orElse(null);
            if (inventory != null && inventory.getQuantity() < quantity) {
                throw new RuntimeException("Insufficient stock");
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return cartRepository.findByUserId(userId).orElse(cart);
    }

    @Transactional
    public Cart removeItem(Long userId, Long itemId) {
        Cart cart = getCart(userId);
        CartItem item = cartItemRepository.findById(itemId)
                .filter(i -> i.getCart().getId().equals(cart.getId()))
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        cartItemRepository.delete(item);
        return cartRepository.findByUserId(userId).orElse(cart);
    }

    @Transactional
    public Cart applyCoupon(Long userId, String couponCode) {
        Cart cart = getCart(userId);
        Coupon coupon = couponRepository.findByCodeAndIsActiveTrue(couponCode)
                .orElseThrow(() -> new RuntimeException("Invalid or expired coupon code"));

        if (!coupon.isValid()) {
            throw new RuntimeException("Coupon is expired or usage limit reached");
        }

        cart.setCoupon(coupon);
        return cartRepository.save(cart);
    }

    @Transactional
    public Cart removeCoupon(Long userId) {
        Cart cart = getCart(userId);
        cart.setCoupon(null);
        return cartRepository.save(cart);
    }

    @Transactional
    public void clearCart(Long userId) {
        Cart cart = getCart(userId);
        cart.getItems().clear();
        cart.setCoupon(null);
        cartRepository.save(cart);
    }

    public BigDecimal calculateSubtotal(Cart cart) {
        return cart.getItems().stream()
                .map(item -> {
                    BigDecimal price = item.getProduct().getDiscountPrice() != null
                            ? item.getProduct().getDiscountPrice()
                            : item.getProduct().getOriginalPrice();
                    BigDecimal qty = BigDecimal.valueOf(item.getQuantity());
                    BigDecimal giftCharge = item.getGiftPackaging() == CartItem.GiftPackaging.PREMIUM
                            ? GIFT_PACKAGING_CHARGE : BigDecimal.ZERO;
                    return price.multiply(qty).add(giftCharge);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal calculateDiscount(Cart cart, BigDecimal subtotal) {
        if (cart.getCoupon() == null || !cart.getCoupon().isValid()) return BigDecimal.ZERO;
        Coupon coupon = cart.getCoupon();
        return switch (coupon.getType()) {
            case PERCENTAGE, FESTIVAL -> {
                BigDecimal discount = subtotal.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100));
                yield coupon.getMaxDiscountAmount() != null ? discount.min(coupon.getMaxDiscountAmount()) : discount;
            }
            case FIXED, FIRST_ORDER -> coupon.getDiscountValue().min(subtotal);
        };
    }

    public BigDecimal calculateShipping(BigDecimal subtotalAfterDiscount) {
        return subtotalAfterDiscount.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 ? BigDecimal.ZERO : SHIPPING_CHARGE;
    }
}
