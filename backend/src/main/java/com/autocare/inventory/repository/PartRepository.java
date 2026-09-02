package com.autocare.inventory.repository;

import com.autocare.inventory.entity.Part;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PartRepository extends JpaRepository<Part, String> {
    Optional<Part> findByCode(String code);
    List<Part> findByIsActiveTrue();

    @Query("SELECT p FROM Part p WHERE p.stockQuantity <= p.minimumStock AND p.isActive = true")
    List<Part> findLowStockParts();
}