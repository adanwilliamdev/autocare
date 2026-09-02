package com.autocare.client.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientRequestDTO {

    @NotBlank(message = "Nome é obrigatório")
    private String name;

    private String cpf;

    private String phone;

    @Email(message = "Email inválido")
    private String email;

    private String address;
}