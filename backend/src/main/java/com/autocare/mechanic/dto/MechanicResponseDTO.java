package com.autocare.mechanic.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("isAvailable")
    private boolean isAvailable;
    private LocalDateTime createdAt;
    @JsonProperty("isActive")
    private boolean isActive;
}