package com.autocare.mechanic.service;

import com.autocare.mechanic.dto.MechanicRequestDTO;
import com.autocare.mechanic.dto.MechanicResponseDTO;
import com.autocare.mechanic.entity.Mechanic;
import com.autocare.mechanic.repository.MechanicRepository;
import com.autocare.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MechanicService {

    private final MechanicRepository mechanicRepository;

    @Transactional
    public MechanicResponseDTO create(MechanicRequestDTO request) {
        Mechanic mechanic = Mechanic.builder()
                .name(request.getName())
                .specialty(request.getSpecialty())
                .phone(request.getPhone())
                .isAvailable(true)
                .isActive(true)
                .build();

        mechanic = mechanicRepository.save(mechanic);
        return toResponseDTO(mechanic);
    }

    @Transactional
    public MechanicResponseDTO update(String id, MechanicRequestDTO request) {
        Mechanic mechanic = findById(id);

        mechanic.setName(request.getName());
        mechanic.setSpecialty(request.getSpecialty());
        mechanic.setPhone(request.getPhone());

        mechanic = mechanicRepository.save(mechanic);
        return toResponseDTO(mechanic);
    }

    @Transactional
    public void delete(String id) {
        Mechanic mechanic = findById(id);
        mechanic.setActive(false);
        mechanicRepository.save(mechanic);
    }

    @Transactional
    public void setAvailability(String id, boolean available) {
        Mechanic mechanic = findById(id);
        mechanic.setAvailable(available);
        mechanicRepository.save(mechanic);
    }

    public MechanicResponseDTO findByIdResponse(String id) {
        return toResponseDTO(findById(id));
    }

    public List<MechanicResponseDTO> findAll() {
        return mechanicRepository.findByIsActiveTrue()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<MechanicResponseDTO> findAvailable() {
        return mechanicRepository.findByIsAvailableTrue()
                .stream()
                .filter(Mechanic::isActive)
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public Mechanic findById(String id) {
        return mechanicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mecânico não encontrado com ID: " + id));
    }

    private MechanicResponseDTO toResponseDTO(Mechanic mechanic) {
        return MechanicResponseDTO.builder()
                .id(mechanic.getId())
                .name(mechanic.getName())
                .specialty(mechanic.getSpecialty())
                .phone(mechanic.getPhone())
                .isAvailable(mechanic.isAvailable())
                .createdAt(mechanic.getCreatedAt())
                .isActive(mechanic.isActive())
                .build();
    }
}