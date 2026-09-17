package com.autocare.mechanic.controller;

import com.autocare.mechanic.dto.MechanicRequestDTO;
import com.autocare.mechanic.dto.MechanicResponseDTO;
import com.autocare.mechanic.service.MechanicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Gestão da equipe (cadastro de mecânicos) é responsabilidade de ADMIN/MANAGER.
 * Leitura é liberada também para RECEPTIONIST, que precisa consultar mecânicos
 * disponíveis para atribuir a uma ordem de serviço.
 */
@RestController
@RequestMapping("/mechanics")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
public class MechanicController {

    private final MechanicService mechanicService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<MechanicResponseDTO> create(@Valid @RequestBody MechanicRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mechanicService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<MechanicResponseDTO>> findAll() {
        return ResponseEntity.ok(mechanicService.findAll());
    }

    @GetMapping("/available")
    public ResponseEntity<List<MechanicResponseDTO>> findAvailable() {
        return ResponseEntity.ok(mechanicService.findAvailable());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MechanicResponseDTO> findById(@PathVariable String id) {
        return ResponseEntity.ok(mechanicService.findByIdResponse(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<MechanicResponseDTO> update(
            @PathVariable String id,
            @Valid @RequestBody MechanicRequestDTO request) {
        return ResponseEntity.ok(mechanicService.update(id, request));
    }

    @PatchMapping("/{id}/availability")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> setAvailability(
            @PathVariable String id,
            @RequestParam boolean available) {
        mechanicService.setAvailability(id, available);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> delete(@PathVariable String id) {
        mechanicService.delete(id);
        return ResponseEntity.noContent().build();
    }
}