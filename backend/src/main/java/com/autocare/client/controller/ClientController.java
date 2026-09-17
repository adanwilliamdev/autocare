package com.autocare.client.controller;

import com.autocare.client.dto.ClientRequestDTO;
import com.autocare.client.dto.ClientResponseDTO;
import com.autocare.client.service.ClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Leitura liberada para ADMIN, RECEPTIONIST e MANAGER (relatórios/dashboard). Escrita
 * restrita a ADMIN e RECEPTIONIST, que são os papéis responsáveis pelo cadastro de
 * clientes conforme a tabela de permissões do projeto.
 */
@RestController
@RequestMapping("/clients")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'MANAGER')")
public class ClientController {

    private final ClientService clientService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<ClientResponseDTO> create(@Valid @RequestBody ClientRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clientService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<ClientResponseDTO>> findAll() {
        return ResponseEntity.ok(clientService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientResponseDTO> findById(@PathVariable String id) {
        return ResponseEntity.ok(clientService.findByIdResponse(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ClientResponseDTO>> searchByName(@RequestParam String name) {
        return ResponseEntity.ok(clientService.searchByName(name));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<ClientResponseDTO> update(
            @PathVariable String id,
            @Valid @RequestBody ClientRequestDTO request) {
        return ResponseEntity.ok(clientService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> delete(@PathVariable String id) {
        clientService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> activate(@PathVariable String id) {
        clientService.activate(id);
        return ResponseEntity.noContent().build();
    }
}