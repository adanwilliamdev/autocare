package com.autocare.budget.dto;

import com.autocare.budget.entity.BudgetStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponseDTO {
    private String id;
    private String budgetNumber;
    private String clientId;
    private String clientName;
    private String vehicleId;
    private String vehicleInfo;
    private String serviceOrderId;
    private String description;
    private BigDecimal totalAmount;
    private BudgetStatus status;
    private LocalDateTime validUntil;
    private LocalDateTime createdAt;
}