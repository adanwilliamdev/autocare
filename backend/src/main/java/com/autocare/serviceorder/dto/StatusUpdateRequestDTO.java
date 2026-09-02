package com.autocare.serviceorder.dto;

import com.autocare.serviceorder.entity.ServiceOrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdateRequestDTO {

    @NotNull(message = "Status é obrigatório")
    private ServiceOrderStatus status;

    private String diagnosis;
}