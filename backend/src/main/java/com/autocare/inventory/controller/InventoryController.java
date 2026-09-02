package com.autocare.inventory.controller;

import com.autocare.inventory.dto.InventoryMovementDTO;
import com.autocare.inventory.dto.PartRequestDTO;
import com.autocare.inventory.dto.PartResponseDTO;
import com.autocare.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    // Parts
    @PostMapping("/parts")
    public ResponseEntity<PartResponseDTO> createPart(@Valid @RequestBody PartRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.createPart(request));
    }

    @GetMapping("/parts")
    public ResponseEntity<List<PartResponseDTO>> findAllParts() {
        return ResponseEntity.ok(inventoryService.findAllParts());
    }

    @GetMapping("/parts/low-stock")
    public ResponseEntity<List<PartResponseDTO>> findLowStockParts() {
        return ResponseEntity.ok(inventoryService.findLowStockParts());
    }

    @GetMapping("/parts/{id}")
    public ResponseEntity<PartResponseDTO> findPartById(@PathVariable String id) {
        return ResponseEntity.ok(inventoryService.findPartByIdResponse(id));
    }

    @PutMapping("/parts/{id}")
    public ResponseEntity<PartResponseDTO> updatePart(
            @PathVariable String id,
            @Valid @RequestBody PartRequestDTO request) {
        return ResponseEntity.ok(inventoryService.updatePart(id, request));
    }

    @DeleteMapping("/parts/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> deletePart(@PathVariable String id) {
        inventoryService.deletePart(id);
        return ResponseEntity.noContent().build();
    }

    // Stock Movements
    @PostMapping("/parts/{id}/add-stock")
    public ResponseEntity<Void> addStock(
            @PathVariable String id,
            @RequestParam Integer quantity,
            @RequestParam String reason,
            @RequestParam String userId) {
        inventoryService.addStock(id, quantity, reason, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/parts/{id}/remove-stock")
    public ResponseEntity<Void> removeStock(
            @PathVariable String id,
            @RequestParam Integer quantity,
            @RequestParam String reason,
            @RequestParam String userId) {
        inventoryService.removeStock(id, quantity, reason, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/parts/{id}/movements")
    public ResponseEntity<List<InventoryMovementDTO>> getPartMovements(@PathVariable String id) {
        return ResponseEntity.ok(inventoryService.getPartMovements(id));
    }
}