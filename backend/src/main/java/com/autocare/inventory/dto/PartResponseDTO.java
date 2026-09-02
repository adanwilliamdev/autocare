package com.autocare.inventory.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
public class PartResponseDTO {
    private String id;
    private String name;
    private String code;
    private String manufacturer;
    private BigDecimal purchasePrice;
    private BigDecimal salePrice;
    private Integer stockQuantity;
    private Integer minimumStock;
    @JsonProperty("isLowStock")
    private boolean isLowStock;
    private LocalDateTime createdAt;
    @JsonProperty("isActive")
    private boolean isActive;
}