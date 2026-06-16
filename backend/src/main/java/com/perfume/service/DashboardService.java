package com.perfume.service;

import com.perfume.dto.response.DashboardResponse;
import com.perfume.dto.response.OrderResponse;
import com.perfume.dto.response.ProductResponse;
import com.perfume.model.User;
import com.perfume.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired private OrderRepository orderRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private ProductService productService;

    public DashboardResponse getDashboard() {
        BigDecimal totalRevenue = orderRepository.getTotalRevenue();
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        long totalOrders = orderRepository.getTotalOrders();
        long totalCustomers = userRepository.countByIsBlockedFalse();
        long totalProducts = productRepository.countByIsActiveTrue();

        // Monthly sales for current year
        int year = LocalDateTime.now().getYear();
        List<Object[]> rawMonthly = orderRepository.getMonthlySales(year);
        List<Map<String, Object>> monthlySales = new ArrayList<>();
        for (Object[] row : rawMonthly) {
            Map<String, Object> m = new HashMap<>();
            m.put("month", getMonthName((Integer) row[0]));
            m.put("revenue", row[1]);
            monthlySales.add(m);
        }

        // Best selling products
        List<ProductResponse> bestSellers = productRepository.findByIsBestSellerTrueAndIsActiveTrue()
                .stream().limit(5).map(ProductResponse::from).collect(Collectors.toList());

        // Recent orders
        List<OrderResponse> recentOrders = orderRepository.findRecentOrders(PageRequest.of(0, 10))
                .stream().map(OrderResponse::from).collect(Collectors.toList());

        // Low stock products
        List<ProductResponse> lowStock = productService.getLowStockProducts(10);

        // Pending orders today
        long ordersToday = orderRepository.countOrdersSince(LocalDateTime.now().withHour(0).withMinute(0).withSecond(0));

        return DashboardResponse.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalCustomers(totalCustomers)
                .totalProducts(totalProducts)
                .monthlySales(monthlySales)
                .bestSellingProducts(bestSellers)
                .recentOrders(recentOrders)
                .lowStockProducts(lowStock)
                .ordersToday(ordersToday)
                .build();
    }

    private String getMonthName(int month) {
        String[] months = {"Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"};
        return months[month - 1];
    }

    public List<User> getAllCustomers(int page, int size) {
        return userRepository.findAll(PageRequest.of(page, size)).getContent();
    }

    public void blockUser(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setIsBlocked(true);
            userRepository.save(user);
        });
    }

    public void unblockUser(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setIsBlocked(false);
            userRepository.save(user);
        });
    }
}
