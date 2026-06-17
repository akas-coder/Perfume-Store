package com.perfume.util;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Utility for extracting authenticated user/admin IDs from JWT request attributes.
 * The JwtAuthFilter sets these attributes after validating the Bearer token.
 *
 * This class preserves the same API as the old session-based SessionUtil,
 * so existing controllers require zero changes.
 */
public class SessionUtil {

    public static final String JWT_USER_ID_ATTR = "jwt_user_id";
    public static final String JWT_ROLE_ATTR = "jwt_role";

    public static Long getCurrentUserId(HttpServletRequest request) {
        Object userId = request.getAttribute(JWT_USER_ID_ATTR);
        String role = getCurrentRole(request);
        if (userId instanceof Long && "USER".equals(role)) {
            return (Long) userId;
        }
        return null;
    }

    public static Long getCurrentAdminId(HttpServletRequest request) {
        Object userId = request.getAttribute(JWT_USER_ID_ATTR);
        String role = getCurrentRole(request);
        if (userId instanceof Long && "ADMIN".equals(role)) {
            return (Long) userId;
        }
        return null;
    }

    public static String getCurrentRole(HttpServletRequest request) {
        Object role = request.getAttribute(JWT_ROLE_ATTR);
        return role instanceof String ? (String) role : null;
    }

    public static boolean isUserLoggedIn(HttpServletRequest request) {
        return getCurrentUserId(request) != null;
    }

    public static boolean isAdminLoggedIn(HttpServletRequest request) {
        return getCurrentAdminId(request) != null;
    }
}
