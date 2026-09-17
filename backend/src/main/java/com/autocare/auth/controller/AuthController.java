package com.autocare.auth.controller;

import com.autocare.auth.dto.CreateUserRequest;
import com.autocare.auth.dto.LoginRequest;
import com.autocare.auth.dto.LoginResponse;
import com.autocare.auth.dto.RefreshTokenRequest;
import com.autocare.auth.dto.RegisterRequest;
import com.autocare.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request);
        return ResponseEntity.noContent().build();
    }

    /**
     * Autocadastro público. Sempre cria a conta como RECEPTIONIST — ver AuthService.register.
     */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /**
     * Criação de usuário com papel arbitrário (ADMIN, MANAGER, MECHANIC, RECEPTIONIST).
     * Restrito a administradores — corrige a falha em que /auth/register aceitava
     * qualquer "role" enviado pelo próprio cliente.
     */
    @PostMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Void> createUser(@Valid @RequestBody CreateUserRequest request) {
        authService.createUserByAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
