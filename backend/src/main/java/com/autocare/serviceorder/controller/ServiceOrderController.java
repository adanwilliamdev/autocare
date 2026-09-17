package com.autocare.serviceorder.controller;

import com.autocare.serviceorder.dto.ServiceOrderRequestDTO;
import com.autocare.serviceorder.dto.ServiceOrderResponseDTO;
import com.autocare.serviceorder.dto.StatusUpdateRequestDTO;
import com.autocare.serviceorder.entity.ServiceOrderStatus;
import com.autocare.serviceorder.service.ServiceOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * MECHANIC só é liberado em findById/updateStatus (para ver e diagnosticar a própria OS);
 * a restrição "somente a que foi atribuída a ele" é aplicada em
 * ServiceOrderService#assertCanAccessOrder, pois @PreAuthorize sozinho não sabe qual
 * mecânico está por trás do ID da URL.
 */
@RestController
@RequestMapping("/service-orders")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
public class ServiceOrderController {

    private final ServiceOrderService serviceOrderService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<ServiceOrderResponseDTO> create(@Valid @RequestBody ServiceOrderRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(serviceOrderService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<ServiceOrderResponseDTO>> findAll() {
        return ResponseEntity.ok(serviceOrderService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST', 'MECHANIC')")
    public ResponseEntity<ServiceOrderResponseDTO> findById(@PathVariable String id) {
        return ResponseEntity.ok(serviceOrderService.findByIdResponse(id));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<ServiceOrderResponseDTO>> findByClient(@PathVariable String clientId) {
        return ResponseEntity.ok(serviceOrderService.findByClient(clientId));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<ServiceOrderResponseDTO>> findByVehicle(@PathVariable String vehicleId) {
        return ResponseEntity.ok(serviceOrderService.findByVehicle(vehicleId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ServiceOrderResponseDTO>> findByStatus(@PathVariable ServiceOrderStatus status) {
        return ResponseEntity.ok(serviceOrderService.findByStatus(status));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'MECHANIC')")
    public ResponseEntity<ServiceOrderResponseDTO> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody StatusUpdateRequestDTO request) {
        return ResponseEntity.ok(serviceOrderService.updateStatus(id, request));
    }

    @PatchMapping("/{id}/mechanic")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<ServiceOrderResponseDTO> assignMechanic(
            @PathVariable String id,
            @RequestParam String mechanicId) {
        return ResponseEntity.ok(serviceOrderService.assignMechanic(id, mechanicId));
    }
}