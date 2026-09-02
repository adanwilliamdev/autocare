package com.autocare.budget.service;

import com.autocare.budget.dto.BudgetRequestDTO;
import com.autocare.budget.dto.BudgetResponseDTO;
import com.autocare.budget.entity.Budget;
import com.autocare.budget.entity.BudgetStatus;
import com.autocare.budget.repository.BudgetRepository;
import com.autocare.client.service.ClientService;
import com.autocare.serviceorder.entity.ServiceOrder;
import com.autocare.serviceorder.service.ServiceOrderService;
import com.autocare.shared.exception.BusinessException;
import com.autocare.shared.exception.ResourceNotFoundException;
import com.autocare.vehicle.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final ClientService clientService;
    private final VehicleService vehicleService;
    private final ServiceOrderService serviceOrderService;

    @Transactional
    public BudgetResponseDTO create(BudgetRequestDTO request) {
        var client = clientService.findById(request.getClientId());
        var vehicle = vehicleService.findById(request.getVehicleId());

        ServiceOrder serviceOrder = null;
        if (request.getServiceOrderId() != null) {
            serviceOrder = serviceOrderService.findById(request.getServiceOrderId());
        }

        String budgetNumber = generateBudgetNumber();

        Budget budget = Budget.builder()
                .budgetNumber(budgetNumber)
                .client(client)
                .vehicle(vehicle)
                .serviceOrder(serviceOrder)
                .description(request.getDescription())
                .totalAmount(request.getTotalAmount())
                .validUntil(request.getValidUntil())
                .status(BudgetStatus.PENDENTE)
                .build();

        budget = budgetRepository.save(budget);
        return toResponseDTO(budget);
    }

    @Transactional
    public BudgetResponseDTO approve(String id) {
        Budget budget = findById(id);

        if (budget.getStatus() != BudgetStatus.PENDENTE) {
            throw new BusinessException("Apenas orçamentos pendentes podem ser aprovados");
        }

        budget.setStatus(BudgetStatus.APROVADO);
        budget = budgetRepository.save(budget);
        return toResponseDTO(budget);
    }

    @Transactional
    public BudgetResponseDTO reject(String id) {
        Budget budget = findById(id);

        if (budget.getStatus() != BudgetStatus.PENDENTE) {
            throw new BusinessException("Apenas orçamentos pendentes podem ser recusados");
        }

        budget.setStatus(BudgetStatus.RECUSADO);
        budget = budgetRepository.save(budget);
        return toResponseDTO(budget);
    }

    public BudgetResponseDTO findByIdResponse(String id) {
        return toResponseDTO(findById(id));
    }

    public List<BudgetResponseDTO> findAll() {
        return budgetRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<BudgetResponseDTO> findByClient(String clientId) {
        return budgetRepository.findByClientId(clientId)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<BudgetResponseDTO> findByStatus(BudgetStatus status) {
        return budgetRepository.findByStatus(status)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public Budget findById(String id) {
        return budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Orçamento não encontrado com ID: " + id));
    }

    private String generateBudgetNumber() {
        String prefix = "BUD";
        String year = String.valueOf(LocalDateTime.now().getYear());
        String sequence = String.format("%06d", budgetRepository.count() + 1);
        return prefix + year + sequence;
    }

    private BudgetResponseDTO toResponseDTO(Budget budget) {
        return BudgetResponseDTO.builder()
                .id(budget.getId())
                .budgetNumber(budget.getBudgetNumber())
                .clientId(budget.getClient().getId())
                .clientName(budget.getClient().getName())
                .vehicleId(budget.getVehicle().getId())
                .vehicleInfo(budget.getVehicle().getBrand() + " " +
                        budget.getVehicle().getModel() + " (" +
                        budget.getVehicle().getPlate() + ")")
                .serviceOrderId(budget.getServiceOrder() != null ? budget.getServiceOrder().getId() : null)
                .description(budget.getDescription())
                .totalAmount(budget.getTotalAmount())
                .status(budget.getStatus())
                .validUntil(budget.getValidUntil())
                .createdAt(budget.getCreatedAt())
                .build();
    }
}