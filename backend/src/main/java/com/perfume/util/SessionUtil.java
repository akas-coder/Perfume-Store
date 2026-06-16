package com.perfume.util;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

public class SessionUtil {

    public static final String USER_SESSION_KEY = "LOGGED_IN_USER";
    public static final String ADMIN_SESSION_KEY = "LOGGED_IN_ADMIN";

    public static void setUser(HttpServletRequest request, Long userId) {
        HttpSession session = request.getSession(true);
        session.setAttribute(USER_SESSION_KEY, userId);
    }

    public static void setAdmin(HttpServletRequest request, Long adminId) {
        HttpSession session = request.getSession(true);
        session.setAttribute(ADMIN_SESSION_KEY, adminId);
    }

    public static Long getCurrentUserId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return null;
        Object userId = session.getAttribute(USER_SESSION_KEY);
        return userId instanceof Long ? (Long) userId : null;
    }

    public static Long getCurrentAdminId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return null;
        Object adminId = session.getAttribute(ADMIN_SESSION_KEY);
        return adminId instanceof Long ? (Long) adminId : null;
    }

    public static boolean isUserLoggedIn(HttpServletRequest request) {
        return getCurrentUserId(request) != null;
    }

    public static boolean isAdminLoggedIn(HttpServletRequest request) {
        return getCurrentAdminId(request) != null;
    }

    public static void invalidateSession(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }
}
