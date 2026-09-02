package com.autocare.client.service;

import com.autocare.client.dto.ClientRequestDTO;
import com.autocare.client.dto.ClientResponseDTO;
import com.autocare.client.entity.Client;
import com.autocare.client.repository.ClientRepository;
import com.autocare.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;

    @Transactional
    public ClientResponseDTO create(ClientRequestDTO request) {
        Client client = Client.builder()
                .name(request.getName())
                .cpf(request.getCpf())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .isActive(true)
                .build();

        client = clientRepository.save(client);
        return toResponseDTO(client);
    }

    @Transactional
    public ClientResponseDTO update(String id, ClientRequestDTO request) {
        Client client = findById(id);

        client.setName(request.getName());
        client.setCpf(request.getCpf());
        client.setPhone(request.getPhone());
        client.setEmail(request.getEmail());
        client.setAddress(request.getAddress());

        client = clientRepository.save(client);
        return toResponseDTO(client);
    }

    @Transactional
    public void delete(String id) {
        Client client = findById(id);
        client.setActive(false);
        clientRepository.save(client);
    }

    @Transactional
    public void activate(String id) {
        Client client = findById(id);
        client.setActive(true);
        clientRepository.save(client);
    }

    public ClientResponseDTO findByIdResponse(String id) {
        return toResponseDTO(findById(id));
    }

    public List<ClientResponseDTO> findAll() {
        return clientRepository.findByIsActiveTrue()
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<ClientResponseDTO> searchByName(String name) {
        return clientRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public Client findById(String id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com ID: " + id));
    }

    private ClientResponseDTO toResponseDTO(Client client) {
        return ClientResponseDTO.builder()
                .id(client.getId())
                .name(client.getName())
                .cpf(client.getCpf())
                .phone(client.getPhone())
                .email(client.getEmail())
                .address(client.getAddress())
                .createdAt(client.getCreatedAt())
                .isActive(client.isActive())
                .vehicleCount(client.getVehicles() != null ? client.getVehicles().size() : 0)
                .build();
    }
}