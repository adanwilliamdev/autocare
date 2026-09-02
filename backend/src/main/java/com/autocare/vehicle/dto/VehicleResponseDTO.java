package com.autocare.vehicle.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleResponseDTO {
    private String id;
    private String plate;
    private String brand;
    private String model;
    private Integer year;
    private Integer mileage;
    private String fuelType;
    private String clientId;
    private String clientName;
    private LocalDateTime createdAt;
    private boolean isActive;
}