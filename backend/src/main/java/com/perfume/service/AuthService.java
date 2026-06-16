package com.perfume.service;

import com.perfume.dto.request.LoginRequest;
import com.perfume.dto.request.RegisterRequest;
import com.perfume.dto.response.UserResponse;
import com.perfume.model.Admin;
import com.perfume.model.Cart;
import com.perfume.model.User;
import com.perfume.repository.AdminRepository;
import com.perfume.repository.CartRepository;
import com.perfume.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import com.perfume.util.SessionUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private AdminRepository adminRepository;
    @Autowired private CartRepository cartRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .build();
        user = userRepository.save(user);

        // Create cart for user
        Cart cart = Cart.builder().user(user).build();
        cartRepository.save(cart);

        return UserResponse.from(user);
    }

    public UserResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (user.getIsBlocked()) {
            throw new RuntimeException("Your account has been blocked. Please contact support.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        SessionUtil.setUser(httpRequest, user.getId());
        return UserResponse.from(user);
    }

    public Admin adminLogin(LoginRequest request, HttpServletRequest httpRequest) {
        Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid admin credentials"));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new RuntimeException("Invalid admin credentials");
        }

        SessionUtil.setAdmin(httpRequest, admin.getId());
        return admin;
    }

    public void logout(HttpServletRequest request) {
        SessionUtil.invalidateSession(request);
    }

    public UserResponse getCurrentUser(HttpServletRequest request) {
        Long userId = SessionUtil.getCurrentUserId(request);
        if (userId == null) return null;
        return userRepository.findById(userId)
                .map(UserResponse::from)
                .orElse(null);
    }
}
