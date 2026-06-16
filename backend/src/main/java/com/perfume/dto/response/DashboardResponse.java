package com.perfume.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardResponse {
    private BigDecimal totalRevenue;
    private long totalOrders;
    private long totalCustomers;
    private long totalProducts;
    private List<Map<String, Object>> monthlySales;
    private List<ProductResponse> bestSellingProducts;
    private List<OrderResponse> recentOrders;
    private List<ProductResponse> lowStockProducts;
    private long pendingOrders;
    private long ordersToday;
}
