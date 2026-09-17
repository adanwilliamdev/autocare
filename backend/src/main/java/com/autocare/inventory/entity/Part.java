package com.autocare.inventory.entity;

import com.autocare.shared.exception.BusinessException;
import com.autocare.shared.exception.InsufficientStockException;
import jakarta.persistence.*;
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
@Entity
@Table(name = "parts")
public class Part {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String code;

    private String manufacturer;

    @Column(name = "purchase_price")
    private BigDecimal purchasePrice;

    @Column(name = "sale_price")
    private BigDecimal salePrice;

    @Column(name = "stock_quantity")
    private Integer stockQuantity = 0;

    @Column(name = "minimum_stock")
    private Integer minimumStock = 5;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_active")
    private boolean isActive = true;

    // Lock otimista: sem isso, duas requisições concorrentes de addStock/removeStock
    // (ex.: duas OS baixando a mesma peça ao mesmo tempo) podem ler o mesmo valor de
    // stockQuantity, cada uma calcular seu próprio resultado e a última a salvar
    // sobrescrever a alteração da outra ("lost update"), deixando o estoque incorreto.
    // Com @Version, o Hibernate falha a segunda escrita com OptimisticLockException,
    // permitindo detectar e reprocessar o conflito em vez de silenciosamente corrompê-lo.
    @Version
    @Column(name = "version", nullable = false)
    @Builder.Default
    private Long version = 0L;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void addStock(Integer quantity) {
        // Antes lançava IllegalArgumentException, que não é tratada especificamente pelo
        // GlobalExceptionHandler e caía no handler genérico -> HTTP 500 "Erro interno do
        // servidor", escondendo do usuário a mensagem real. BusinessException já tem
        // handler dedicado -> HTTP 400 com a mensagem correta.
        if (quantity <= 0) {
            throw new BusinessException("Quantidade deve ser positiva");
        }
        this.stockQuantity += quantity;
    }

    public void removeStock(Integer quantity) {
        if (quantity <= 0) {
            throw new BusinessException("Quantidade deve ser positiva");
        }
        if (this.stockQuantity < quantity) {
            throw new InsufficientStockException("Estoque insuficiente. Disponível: " + this.stockQuantity);
        }
        this.stockQuantity -= quantity;
    }

    public boolean isLowStock() {
        return stockQuantity <= minimumStock;
    }
}