package com.autocare.budget.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
public class BudgetRequestDTO {

    @NotBlank(message = "ID do cliente é obrigatório")
    private String clientId;

    @NotBlank(message = "ID do veículo é obrigatório")
    private String vehicleId;

    private String serviceOrderId;

    private String description;

    @NotNull(message = "Valor total é obrigatório")
    @Positive(message = "Valor total deve ser positivo")
    private BigDecimal totalAmount;

    private LocalDateTime validUntil;
}