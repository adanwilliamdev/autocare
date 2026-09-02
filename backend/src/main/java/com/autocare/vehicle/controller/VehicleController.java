package com.autocare.vehicle.controller;

import com.autocare.vehicle.dto.VehicleRequestDTO;
import com.autocare.vehicle.dto.VehicleResponseDTO;
import com.autocare.vehicle.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping
    public ResponseEntity<VehicleResponseDTO> create(@Valid @RequestBody VehicleRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vehicleService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<VehicleResponseDTO>> findAll() {
        return ResponseEntity.ok(vehicleService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleResponseDTO> findById(@PathVariable String id) {
        return ResponseEntity.ok(vehicleService.findByIdResponse(id));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<VehicleResponseDTO>> findByClient(@PathVariable String clientId) {
        return ResponseEntity.ok(vehicleService.findByClient(clientId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleResponseDTO> update(
            @PathVariable String id,
            @Valid @RequestBody VehicleRequestDTO request) {
        return ResponseEntity.ok(vehicleService.update(id, request));
    }

    @PatchMapping("/{id}/mileage")
    public ResponseEntity<Void> updateMileage(
            @PathVariable String id,
            @RequestParam Integer mileage) {
        vehicleService.updateMileage(id, mileage);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> delete(@PathVariable String id) {
        vehicleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}