package com.autocare.mechanic.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MechanicRequestDTO {

    @NotBlank(message = "Nome é obrigatório")
    private String name;

    private String specialty;
    private String phone;

    // Opcional: vincula este perfil de mecânico a uma conta de login (User com role
    // MECHANIC), permitindo que o próprio mecânico acesse suas OS pelo sistema.
    private String userId;
}