package com.autocare.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartRequestDTO {

    @NotBlank(message = "Nome é obrigatório")
    private String name;

    @NotBlank(message = "Código é obrigatório")
    private String code;

    private String manufacturer;

    @NotNull(message = "Preço de compra é obrigatório")
    @Positive(message = "Preço de compra deve ser positivo")
    private BigDecimal purchasePrice;

    @NotNull(message = "Preço de venda é obrigatório")
    @Positive(message = "Preço de venda deve ser positivo")
    private BigDecimal salePrice;

    @NotNull(message = "Quantidade em estoque é obrigatória")
    @Positive(message = "Quantidade em estoque deve ser positiva")
    private Integer stockQuantity;

    @Positive(message = "Estoque mínimo deve ser positivo")
    private Integer minimumStock;
}