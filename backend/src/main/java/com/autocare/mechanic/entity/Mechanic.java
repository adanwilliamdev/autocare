package com.autocare.mechanic.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "mechanics")
public class Mechanic {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Liga o perfil de mecânico a uma conta de login (users.role = MECHANIC).
    // Sem esse vínculo não há como um usuário autenticado como MECHANIC provar
    // "quem ele é" para o sistema restringir suas ordens de serviço às que lhe
    // foram atribuídas — é o que ServiceOrderService usa para aplicar essa regra.
    // Fica nullable porque nem todo registro de mecânico precisa ter login (pode
    // ser só um cadastro operacional da equipe).
    @Column(name = "user_id", unique = true)
    private String userId;

    @Column(nullable = false)
    private String name;

    private String specialty;

    private String phone;

    @Column(name = "is_available")
    private boolean isAvailable = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_active")
    private boolean isActive = true;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}