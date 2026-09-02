package com.autocare.client.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientResponseDTO {
    private String id;
    private String name;
    private String cpf;
    private String phone;
    private String email;
    private String address;
    private LocalDateTime createdAt;
    @JsonProperty("isActive")
    private boolean isActive;
    private Integer vehicleCount;
}