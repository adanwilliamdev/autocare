package com.autocare.serviceorder.service;

import com.autocare.client.entity.Client;
import com.autocare.client.service.ClientService;
import com.autocare.mechanic.entity.Mechanic;
import com.autocare.mechanic.service.MechanicService;
import com.autocare.serviceorder.dto.ServiceOrderRequestDTO;
import com.autocare.serviceorder.dto.ServiceOrderResponseDTO;
import com.autocare.serviceorder.dto.StatusUpdateRequestDTO;
import com.autocare.serviceorder.entity.ServiceOrder;
import com.autocare.serviceorder.entity.ServiceOrderStatus;
import com.autocare.serviceorder.repository.ServiceOrderRepository;
import com.autocare.shared.exception.BusinessException;
import com.autocare.shared.exception.ResourceNotFoundException;
import com.autocare.vehicle.entity.Vehicle;
import com.autocare.vehicle.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceOrderService {

    private final ServiceOrderRepository serviceOrderRepository;
    private final ClientService clientService;
    private final VehicleService vehicleService;
    private final MechanicService mechanicService;

    @Transactional
    public ServiceOrderResponseDTO create(ServiceOrderRequestDTO request) {
        Client client = clientService.findById(request.getClientId());
        Vehicle vehicle = vehicleService.findById(request.getVehicleId());
        Mechanic mechanic = request.getMechanicId() != null ?
                mechanicService.findById(request.getMechanicId()) : null;

        String orderNumber = generateOrderNumber();

        ServiceOrder serviceOrder = ServiceOrder.builder()
                .orderNumber(orderNumber)
                .client(client)
                .vehicle(vehicle)
                .mechanic(mechanic)
                .reportedProblem(request.getReportedProblem())
                .status(ServiceOrderStatus.CRIADA)
                .totalAmount(java.math.BigDecimal.ZERO)
                .build();

        serviceOrder = serviceOrderRepository.save(serviceOrder);
        return toResponseDTO(serviceOrder);
    }

    @Transactional
    public ServiceOrderResponseDTO updateStatus(String id, StatusUpdateRequestDTO request) {
        ServiceOrder serviceOrder = findById(id);

        validateStatusTransition(serviceOrder.getStatus(), request.getStatus());

        if (request.getDiagnosis() != null) {
            serviceOrder.setDiagnosis(request.getDiagnosis());
        }

        serviceOrder.setStatus(request.getStatus());

        if (request.getStatus() == ServiceOrderStatus.EM_EXECUCAO) {
            serviceOrder.setStartedAt(LocalDateTime.now());
        }

        if (request.getStatus() == ServiceOrderStatus.FINALIZADA) {
            serviceOrder.setCompletedAt(LocalDateTime.now());
        }

        serviceOrder = serviceOrderRepository.save(serviceOrder);
        return toResponseDTO(serviceOrder);
    }

    @Transactional
    public ServiceOrderResponseDTO assignMechanic(String id, String mechanicId) {
        ServiceOrder serviceOrder = findById(id);
        Mechanic mechanic = mechanicService.findById(mechanicId);

        serviceOrder.setMechanic(mechanic);
        serviceOrder = serviceOrderRepository.save(serviceOrder);
        return toResponseDTO(serviceOrder);
    }

    public ServiceOrderResponseDTO findByIdResponse(String id) {
        return toResponseDTO(findById(id));
    }

    public List<ServiceOrderResponseDTO> findAll() {
        return serviceOrderRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<ServiceOrderResponseDTO> findByClient(String clientId) {
        return serviceOrderRepository.findByClientId(clientId)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<ServiceOrderResponseDTO> findByVehicle(String vehicleId) {
        return serviceOrderRepository.findByVehicleId(vehicleId)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<ServiceOrderResponseDTO> findByStatus(ServiceOrderStatus status) {
        return serviceOrderRepository.findByStatus(status)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public ServiceOrder findById(String id) {
        return serviceOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de serviço não encontrada com ID: " + id));
    }

    private void validateStatusTransition(ServiceOrderStatus current, ServiceOrderStatus newStatus) {
        if (current == newStatus) {
            return;
        }

        boolean isValid = switch (current) {
            case CRIADA -> newStatus == ServiceOrderStatus.EM_DIAGNOSTICO || newStatus == ServiceOrderStatus.CANCELADA;
            case EM_DIAGNOSTICO -> newStatus == ServiceOrderStatus.AGUARDANDO_APROVACAO || newStatus == ServiceOrderStatus.CANCELADA;
            case AGUARDANDO_APROVACAO -> newStatus == ServiceOrderStatus.APROVADA || newStatus == ServiceOrderStatus.CANCELADA;
            case APROVADA -> newStatus == ServiceOrderStatus.EM_EXECUCAO || newStatus == ServiceOrderStatus.CANCELADA;
            case EM_EXECUCAO -> newStatus == ServiceOrderStatus.FINALIZADA || newStatus == ServiceOrderStatus.CANCELADA;
            case FINALIZADA, CANCELADA -> false;
        };

        if (!isValid) {
            throw new BusinessException(
                    String.format("Transição de status inválida de %s para %s", current, newStatus)
            );
        }
    }

    private String generateOrderNumber() {
        String prefix = "OS";
        String year = String.valueOf(LocalDateTime.now().getYear());
        String sequence = String.format("%06d", serviceOrderRepository.count() + 1);
        return prefix + year + sequence;
    }

    private ServiceOrderResponseDTO toResponseDTO(ServiceOrder serviceOrder) {
        return ServiceOrderResponseDTO.builder()
                .id(serviceOrder.getId())
                .orderNumber(serviceOrder.getOrderNumber())
                .clientId(serviceOrder.getClient().getId())
                .clientName(serviceOrder.getClient().getName())
                .vehicleId(serviceOrder.getVehicle().getId())
                .vehicleInfo(serviceOrder.getVehicle().getBrand() + " " +
                        serviceOrder.getVehicle().getModel() + " (" +
                        serviceOrder.getVehicle().getPlate() + ")")
                .mechanicId(serviceOrder.getMechanic() != null ? serviceOrder.getMechanic().getId() : null)
                .mechanicName(serviceOrder.getMechanic() != null ? serviceOrder.getMechanic().getName() : null)
                .reportedProblem(serviceOrder.getReportedProblem())
                .diagnosis(serviceOrder.getDiagnosis())
                .status(serviceOrder.getStatus())
                .totalAmount(serviceOrder.getTotalAmount())
                .startedAt(serviceOrder.getStartedAt())
                .completedAt(serviceOrder.getCompletedAt())
                .createdAt(serviceOrder.getCreatedAt())
                .build();
    }
}