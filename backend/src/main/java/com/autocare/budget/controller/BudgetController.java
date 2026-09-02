package com.autocare.budget.controller;

import com.autocare.budget.dto.BudgetRequestDTO;
import com.autocare.budget.dto.BudgetResponseDTO;
import com.autocare.budget.entity.BudgetStatus;
import com.autocare.budget.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    public ResponseEntity<BudgetResponseDTO> create(@Valid @RequestBody BudgetRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(budgetService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<BudgetResponseDTO>> findAll() {
        return ResponseEntity.ok(budgetService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BudgetResponseDTO> findById(@PathVariable String id) {
        return ResponseEntity.ok(budgetService.findByIdResponse(id));
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<BudgetResponseDTO>> findByClient(@PathVariable String clientId) {
        return ResponseEntity.ok(budgetService.findByClient(clientId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<BudgetResponseDTO>> findByStatus(@PathVariable BudgetStatus status) {
        return ResponseEntity.ok(budgetService.findByStatus(status));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<BudgetResponseDTO> approve(@PathVariable String id) {
        return ResponseEntity.ok(budgetService.approve(id));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<BudgetResponseDTO> reject(@PathVariable String id) {
        return ResponseEntity.ok(budgetService.reject(id));
    }
}