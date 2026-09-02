package com.autocare.mechanic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MechanicResponseDTO {
    private String id;
    private String name;
    private String specialty;
    private String phone;
    private boolean isAvailable;
    private LocalDateTime createdAt;
    private boolean isActive;
}