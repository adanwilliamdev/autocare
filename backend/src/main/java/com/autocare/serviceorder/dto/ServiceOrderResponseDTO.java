package com.autocare.serviceorder.dto;

import com.autocare.serviceorder.entity.ServiceOrderStatus;
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
public class ServiceOrderResponseDTO {
    private String id;
    private String orderNumber;
    private String clientId;
    private String clientName;
    private String vehicleId;
    private String vehicleInfo;
    private String mechanicId;
    private String mechanicName;
    private String reportedProblem;
    private String diagnosis;
    private ServiceOrderStatus status;
    private BigDecimal totalAmount;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
}