package com.perfume.repository;

import com.perfume.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    List<Product> findByIsFeaturedTrueAndIsActiveTrue();

    List<Product> findByIsBestSellerTrueAndIsActiveTrue();

    List<Product> findByIsNewArrivalTrueAndIsActiveTrue();

    List<Product> findByIsLuxuryTrueAndIsActiveTrue();

    Page<Product> findByCategoryIdAndIsActiveTrue(Long categoryId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> searchProducts(@Param("query") String query, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.isActive = true ORDER BY p.soldCount DESC")
    List<Product> findTopSelling(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.category.id = :categoryId AND p.id != :excludeId ORDER BY RAND()")
    List<Product> findRelatedProducts(@Param("categoryId") Long categoryId, @Param("excludeId") Long excludeId, Pageable pageable);

    long countByIsActiveTrue();

    @Query("SELECT p FROM Product p JOIN p.inventory i WHERE p.isActive = true AND i.quantity <= i.lowStockThreshold ORDER BY i.quantity ASC")
    List<Product> findLowStockProducts(Pageable pageable);

    @Query("SELECT p.gender, COUNT(p) FROM Product p WHERE p.isActive = true GROUP BY p.gender")
    List<Object[]> countByGender();

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.gender = :gender AND p.fragranceFamily = :family ORDER BY p.avgRating DESC")
    List<Product> findByGenderAndFragranceFamily(@Param("gender") Product.Gender gender, @Param("family") String family, Pageable pageable);
}
