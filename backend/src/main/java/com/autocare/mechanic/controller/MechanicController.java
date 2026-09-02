package com.autocare.mechanic.controller;

import com.autocare.mechanic.dto.MechanicRequestDTO;
import com.autocare.mechanic.dto.MechanicResponseDTO;
import com.autocare.mechanic.service.MechanicService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/mechanics")
@RequiredArgsConstructor
public class MechanicController {

    private final MechanicService mechanicService;

    @PostMapping
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
    public ResponseEntity<MechanicResponseDTO> update(
            @PathVariable String id,
            @Valid @RequestBody MechanicRequestDTO request) {
        return ResponseEntity.ok(mechanicService.update(id, request));
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<Void> setAvailability(
            @PathVariable String id,
            @RequestParam boolean available) {
        mechanicService.setAvailability(id, available);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> delete(@PathVariable String id) {
        mechanicService.delete(id);
        return ResponseEntity.noContent().build();
    }
}