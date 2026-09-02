package com.autocare.inventory.dto;

import com.autocare.inventory.entity.MovementType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryMovementDTO {
    private String id;
    private String partId;
    private String partName;
    private MovementType type;
    private Integer quantity;
    private Integer previousQuantity;
    private Integer currentQuantity;
    private String reason;
    private String referenceId;
    private String userId;
    private LocalDateTime createdAt;
}