package com.autocare.serviceorder.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceOrderRequestDTO {

    @NotBlank(message = "ID do cliente é obrigatório")
    private String clientId;

    @NotBlank(message = "ID do veículo é obrigatório")
    private String vehicleId;

    private String mechanicId;

    private String reportedProblem;
}