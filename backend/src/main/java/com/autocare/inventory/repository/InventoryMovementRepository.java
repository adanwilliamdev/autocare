package com.autocare.inventory.repository;

import com.autocare.inventory.entity.InventoryMovement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, String> {
    List<InventoryMovement> findByPartId(String partId);
    List<InventoryMovement> findByPartIdOrderByCreatedAtDesc(String partId);
}