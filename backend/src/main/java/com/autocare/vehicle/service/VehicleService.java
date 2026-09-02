package com.autocare.vehicle.service;

import com.autocare.client.entity.Client;
import com.autocare.client.service.ClientService;
import com.autocare.shared.exception.BusinessException;
import com.autocare.shared.exception.ResourceNotFoundException;
import com.autocare.vehicle.dto.VehicleRequestDTO;
import com.autocare.vehicle.dto.VehicleResponseDTO;
import com.autocare.vehicle.entity.Vehicle;
import com.autocare.vehicle.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final ClientService clientService;

    @Transactional
    public VehicleResponseDTO create(VehicleRequestDTO request) {
        if (vehicleRepository.existsByPlate(request.getPlate())) {
            throw new BusinessException("Já existe um veículo com esta placa: " + request.getPlate());
        }

        Client client = clientService.findById(request.getClientId());

        Vehicle vehicle = Vehicle.builder()
                .plate(request.getPlate().toUpperCase())
                .brand(request.getBrand())
                .model(request.getModel())
                .year(request.getYear())
                .mileage(request.getMileage())
                .fuelType(request.getFuelType())
                .client(client)
                .isActive(true)
                .build();

        vehicle = vehicleRepository.save(vehicle);
        return toResponseDTO(vehicle);
    }

    @Transactional
    public VehicleResponseDTO update(String id, VehicleRequestDTO request) {
        Vehicle vehicle = findById(id);

        if (!vehicle.getPlate().equals(request.getPlate()) &&
                vehicleRepository.existsByPlate(request.getPlate())) {
            throw new BusinessException("Já existe um veículo com esta placa: " + request.getPlate());
        }

        vehicle.setPlate(request.getPlate().toUpperCase());
        vehicle.setBrand(request.getBrand());
        vehicle.setModel(request.getModel());
        vehicle.setYear(request.getYear());
        vehicle.setMileage(request.getMileage());
        vehicle.setFuelType(request.getFuelType());

        if (!vehicle.getClient().getId().equals(request.getClientId())) {
            Client client = clientService.findById(request.getClientId());
            vehicle.setClient(client);
        }

        vehicle = vehicleRepository.save(vehicle);
        return toResponseDTO(vehicle);
    }

    @Transactional
    public void delete(String id) {
        Vehicle vehicle = findById(id);
        vehicle.setActive(false);
        vehicleRepository.save(vehicle);
    }

    @Transactional
    public void updateMileage(String id, Integer mileage) {
        Vehicle vehicle = findById(id);
        vehicle.setMileage(mileage);
        vehicleRepository.save(vehicle);
    }

    public VehicleResponseDTO findByIdResponse(String id) {
        return toResponseDTO(findById(id));
    }

    public List<VehicleResponseDTO> findAll() {
        return vehicleRepository.findAll()
                .stream()
                .filter(Vehicle::isActive)
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<VehicleResponseDTO> findByClient(String clientId) {
        clientService.findById(clientId); // Verifica se o cliente existe
        return vehicleRepository.findByClientIdAndIsActiveTrue(clientId)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public Vehicle findById(String id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Veículo não encontrado com ID: " + id));
    }

    private VehicleResponseDTO toResponseDTO(Vehicle vehicle) {
        return VehicleResponseDTO.builder()
                .id(vehicle.getId())
                .plate(vehicle.getPlate())
                .brand(vehicle.getBrand())
                .model(vehicle.getModel())
                .year(vehicle.getYear())
                .mileage(vehicle.getMileage())
                .fuelType(vehicle.getFuelType())
                .clientId(vehicle.getClient().getId())
                .clientName(vehicle.getClient().getName())
                .createdAt(vehicle.getCreatedAt())
                .isActive(vehicle.isActive())
                .build();
    }
}