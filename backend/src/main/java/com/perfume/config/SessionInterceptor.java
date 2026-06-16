package com.perfume.config;

import com.perfume.util.SessionUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;
import java.util.List;

@Component
public class SessionInterceptor implements HandlerInterceptor {

    // Paths that require user authentication
    private static final List<String> USER_PROTECTED_PREFIXES = Arrays.asList(
            "/api/cart", "/api/wishlist", "/api/orders", "/api/users",
            "/api/reviews/my", "/api/checkout"
    );

    // Paths that require admin authentication
    private static final List<String> ADMIN_PROTECTED_PREFIXES = Arrays.asList(
            "/api/admin"
    );

    // Paths that are always public
    private static final List<String> PUBLIC_PATHS = Arrays.asList(
            "/api/auth/register", "/api/auth/login", "/api/auth/me",
            "/api/admin/auth/login", "/api/products", "/api/categories",
            "/api/banners", "/api/reviews", "/swagger-ui", "/api-docs"
    );

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Allow OPTIONS (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }

        // Allow public paths
        for (String pub : PUBLIC_PATHS) {
            if (path.startsWith(pub)) {
                return true;
            }
        }

        // Check admin protected paths
        for (String adminPath : ADMIN_PROTECTED_PREFIXES) {
            if (path.startsWith(adminPath)) {
                if (!SessionUtil.isAdminLoggedIn(request)) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"success\":false,\"message\":\"Admin authentication required\"}");
                    return false;
                }
                return true;
            }
        }

        // Check user protected paths
        for (String userPath : USER_PROTECTED_PREFIXES) {
            if (path.startsWith(userPath)) {
                if (!SessionUtil.isUserLoggedIn(request)) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"success\":false,\"message\":\"Authentication required. Please login.\"}");
                    return false;
                }
                return true;
            }
        }

        return true;
    }
}
