package com.autocare.inventory.service;

import com.autocare.inventory.dto.InventoryMovementDTO;
import com.autocare.inventory.dto.PartRequestDTO;
import com.autocare.inventory.dto.PartResponseDTO;
import com.autocare.inventory.entity.InventoryMovement;
import com.autocare.inventory.entity.Part;
import com.autocare.inventory.repository.InventoryMovementRepository;
import com.autocare.inventory.repository.PartRepository;
import com.autocare.shared.exception.BusinessException;
import com.autocare.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final PartRepository partRepository;
    private final InventoryMovementRepository movementRepository;

    @Transactional
    public PartResponseDTO createPart(PartRequestDTO request) {
        if (partRepository.findByCode(request.getCode()).isPresent()) {
            throw new BusinessException("Já existe uma peça com este código: " + request.getCode());
        }

        Part part = Part.builder()
                .name(request.getName())
                .code(request.getCode())
                .manufacturer(request.getManufacturer())
                .purchasePrice(request.getPurchasePrice())
                .salePrice(request.getSalePrice())
                .stockQuantity(request.getStockQuantity())
                .minimumStock(request.getMinimumStock() != null ? request.getMinimumStock() : 5)
                .isActive(true)
                .build();

        part = partRepository.save(part);

        // Registrar movimentação inicial
        InventoryMovement movement = InventoryMovement.createEntry(
                part,
                request.getStockQuantity(),
                "Cadastro inicial",
                "system"
        );
        movementRepository.save(movement);

        return toResponseDTO(part);
    }

    @Transactional
    public PartResponseDTO updatePart(String id, PartRequestDTO request) {
        Part part = findPartById(id);

        if (!part.getCode().equals(request.getCode()) &&
                partRepository.findByCode(request.getCode()).isPresent()) {
            throw new BusinessException("Já existe uma peça com este código: " + request.getCode());
        }

        part.setName(request.getName());
        part.setCode(request.getCode());
        part.setManufacturer(request.getManufacturer());
        part.setPurchasePrice(request.getPurchasePrice());
        part.setSalePrice(request.getSalePrice());
        part.setMinimumStock(request.getMinimumStock() != null ? request.getMinimumStock() : 5);

        part = partRepository.save(part);
        return toResponseDTO(part);
    }

    @Transactional
    public void deletePart(String id) {
        Part part = findPartById(id);
        part.setActive(false);
        partRepository.save(part);
    }

    @Transactional
    public void addStock(String partId, Integer quantity, String reason, String userId) {
        Part part = findPartById(partId);

        int previousQuantity = part.getStockQuantity();
        part.addStock(quantity);
        part = partRepository.save(part);

        InventoryMovement movement = InventoryMovement.createEntry(
                part, quantity, reason, userId
        );
        movementRepository.save(movement);
    }

    @Transactional
    public void removeStock(String partId, Integer quantity, String reason, String userId) {
        Part part = findPartById(partId);

        int previousQuantity = part.getStockQuantity();
        part.removeStock(quantity);
        part = partRepository.save(part);

        InventoryMovement movement = InventoryMovement.createExit(
                part, quantity, reason, userId
        );
        movementRepository.save(movement);
    }

    public PartResponseDTO findPartByIdResponse(String id) {
        return toResponseDTO(findPartById(id));
    }

    public List<PartResponseDTO> findAllParts() {
        return partRepository.findByIsActiveTrue()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<PartResponseDTO> findLowStockParts() {
        return partRepository.findLowStockParts()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<InventoryMovementDTO> getPartMovements(String partId) {
        findPartById(partId); // Verifica se a peça existe
        return movementRepository.findByPartIdOrderByCreatedAtDesc(partId)
                .stream()
                .map(this::toMovementDTO)
                .collect(Collectors.toList());
    }

    public Part findPartById(String id) {
        return partRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Peça não encontrada com ID: " + id));
    }

    private PartResponseDTO toResponseDTO(Part part) {
        return PartResponseDTO.builder()
                .id(part.getId())
                .name(part.getName())
                .code(part.getCode())
                .manufacturer(part.getManufacturer())
                .purchasePrice(part.getPurchasePrice())
                .salePrice(part.getSalePrice())
                .stockQuantity(part.getStockQuantity())
                .minimumStock(part.getMinimumStock())
                .isLowStock(part.isLowStock())
                .createdAt(part.getCreatedAt())
                .isActive(part.isActive())
                .build();
    }

    private InventoryMovementDTO toMovementDTO(InventoryMovement movement) {
        return InventoryMovementDTO.builder()
                .id(movement.getId())
                .partId(movement.getPart().getId())
                .partName(movement.getPart().getName())
                .type(movement.getType())
                .quantity(movement.getQuantity())
                .previousQuantity(movement.getPreviousQuantity())
                .currentQuantity(movement.getCurrentQuantity())
                .reason(movement.getReason())
                .referenceId(movement.getReferenceId())
                .userId(movement.getUserId())
                .createdAt(movement.getCreatedAt())
                .build();
    }
}