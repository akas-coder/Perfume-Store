package com.perfume.dto.response;

import com.perfume.model.User;
import lombok.*;

import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String profileImage;
    private Boolean isBlocked;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .profileImage(user.getProfileImage())
                .isBlocked(user.getIsBlocked())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
