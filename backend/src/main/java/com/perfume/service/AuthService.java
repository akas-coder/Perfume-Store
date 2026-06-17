package com.perfume.service;

import com.perfume.dto.request.LoginRequest;
import com.perfume.dto.request.RegisterRequest;
import com.perfume.dto.response.AuthResponse;
import com.perfume.dto.response.UserResponse;
import com.perfume.model.Admin;
import com.perfume.model.Cart;
import com.perfume.model.User;
import com.perfume.repository.AdminRepository;
import com.perfume.repository.CartRepository;
import com.perfume.repository.UserRepository;
import com.perfume.util.JwtUtil;
import com.perfume.util.SessionUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private AdminRepository adminRepository;
    @Autowired private CartRepository cartRepository;
    @Autowired private BCryptPasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
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

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), "USER");
        return AuthResponse.builder()
                .token(token)
                .user(UserResponse.from(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (user.getIsBlocked()) {
            throw new RuntimeException("Your account has been blocked. Please contact support.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), "USER");
        return AuthResponse.builder()
                .token(token)
                .user(UserResponse.from(user))
                .build();
    }

    public AuthResponse adminLogin(LoginRequest request) {
        Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid admin credentials"));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new RuntimeException("Invalid admin credentials");
        }

        String token = jwtUtil.generateToken(admin.getId(), admin.getEmail(), "ADMIN");
        return AuthResponse.builder()
                .token(token)
                .user(Map.of("id", admin.getId(), "name", admin.getName(), "email", admin.getEmail()))
                .build();
    }

    public void logout() {
        // JWT is stateless — client removes the token.
        // This method exists for API compatibility.
    }

    public UserResponse getCurrentUser(HttpServletRequest request) {
        Long userId = SessionUtil.getCurrentUserId(request);
        if (userId == null) return null;
        return userRepository.findById(userId)
                .map(UserResponse::from)
                .orElse(null);
    }
}
