package com.perfume.repository;

import com.perfume.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT oi.product.id, SUM(oi.quantity) as totalSold FROM OrderItem oi " +
           "WHERE oi.order.status != 'CANCELLED' GROUP BY oi.product.id ORDER BY totalSold DESC")
    List<Object[]> findBestSellingProducts(@Param("limit") int limit);

    boolean existsByOrderUserIdAndProductId(Long userId, Long productId);

    @Modifying
    @Query("UPDATE OrderItem oi SET oi.product = null WHERE oi.product.id = :productId")
    void nullifyProductReferences(@Param("productId") Long productId);
}
