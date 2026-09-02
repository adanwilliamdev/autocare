package com.autocare.inventory.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "inventory_movements")
public class InventoryMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id", nullable = false)
    private Part part;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MovementType type;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "previous_quantity")
    private Integer previousQuantity;

    @Column(name = "current_quantity")
    private Integer currentQuantity;

    private String reason;

    @Column(name = "reference_id")
    private String referenceId;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public static InventoryMovement createEntry(Part part, Integer quantity, String reason, String userId) {
        return InventoryMovement.builder()
                .part(part)
                .type(MovementType.ENTRADA)
                .quantity(quantity)
                .previousQuantity(part.getStockQuantity() - quantity)
                .currentQuantity(part.getStockQuantity())
                .reason(reason)
                .userId(userId)
                .build();
    }

    public static InventoryMovement createExit(Part part, Integer quantity, String reason, String userId) {
        return InventoryMovement.builder()
                .part(part)
                .type(MovementType.SAIDA)
                .quantity(quantity)
                .previousQuantity(part.getStockQuantity() + quantity)
                .currentQuantity(part.getStockQuantity())
                .reason(reason)
                .userId(userId)
                .build();
    }
}