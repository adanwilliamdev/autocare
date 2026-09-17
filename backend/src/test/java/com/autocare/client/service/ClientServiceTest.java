package com.autocare.client.service;

import com.autocare.client.dto.ClientRequestDTO;
import com.autocare.client.dto.ClientResponseDTO;
import com.autocare.client.entity.Client;
import com.autocare.client.repository.ClientRepository;
import com.autocare.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ClientService")
class ClientServiceTest {

    @Mock
    private ClientRepository clientRepository;

    @InjectMocks
    private ClientService clientService;

    private Client existingClient;

    @BeforeEach
    void setUp() {
        existingClient = Client.builder()
                .id("client-1")
                .name("João da Silva")
                .cpf("111.222.333-44")
                .phone("11999990000")
                .email("joao@example.com")
                .address("Rua A, 123")
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("deve criar um cliente e retornar o DTO correspondente")
    void shouldCreateClient() {
        ClientRequestDTO request = ClientRequestDTO.builder()
                .name("Maria Souza")
                .cpf("555.666.777-88")
                .phone("11988887777")
                .email("maria@example.com")
                .address("Rua B, 456")
                .build();

        when(clientRepository.save(any(Client.class))).thenAnswer(invocation -> {
            Client toSave = invocation.getArgument(0);
            toSave.setId("client-2");
            return toSave;
        });

        ClientResponseDTO response = clientService.create(request);

        assertThat(response.getId()).isEqualTo("client-2");
        assertThat(response.getName()).isEqualTo("Maria Souza");
        assertThat(response.getCpf()).isEqualTo("555.666.777-88");
        assertThat(response.isActive()).isTrue();

        ArgumentCaptor<Client> captor = ArgumentCaptor.forClass(Client.class);
        verify(clientRepository).save(captor.capture());
        assertThat(captor.getValue().isActive()).isTrue();
    }

    @Test
    @DisplayName("deve lançar ResourceNotFoundException ao buscar um ID inexistente")
    void shouldThrowWhenClientNotFound() {
        when(clientRepository.findById("does-not-exist")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> clientService.findById("does-not-exist"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("does-not-exist");

        verify(clientRepository, never()).save(any());
    }

    @Test
    @DisplayName("deve retornar o cliente quando o ID existe")
    void shouldReturnClientWhenFound() {
        when(clientRepository.findById("client-1")).thenReturn(Optional.of(existingClient));

        Client found = clientService.findById("client-1");

        assertThat(found).isEqualTo(existingClient);
    }

    @Test
    @DisplayName("deve atualizar os dados de um cliente existente")
    void shouldUpdateClient() {
        when(clientRepository.findById("client-1")).thenReturn(Optional.of(existingClient));
        when(clientRepository.save(any(Client.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ClientRequestDTO request = ClientRequestDTO.builder()
                .name("João da Silva Atualizado")
                .cpf(existingClient.getCpf())
                .phone("11911112222")
                .email("joao.novo@example.com")
                .address("Rua C, 789")
                .build();

        ClientResponseDTO response = clientService.update("client-1", request);

        assertThat(response.getName()).isEqualTo("João da Silva Atualizado");
        assertThat(response.getPhone()).isEqualTo("11911112222");
        assertThat(response.getEmail()).isEqualTo("joao.novo@example.com");
    }

    @Test
    @DisplayName("delete deve fazer soft delete (desativar) em vez de remover o registro")
    void shouldSoftDeleteClient() {
        when(clientRepository.findById("client-1")).thenReturn(Optional.of(existingClient));
        when(clientRepository.save(any(Client.class))).thenAnswer(invocation -> invocation.getArgument(0));

        clientService.delete("client-1");

        ArgumentCaptor<Client> captor = ArgumentCaptor.forClass(Client.class);
        verify(clientRepository).save(captor.capture());
        assertThat(captor.getValue().isActive()).isFalse();
        // Garante que é soft delete: nunca deve chamar delete/deleteById no repositório.
        verify(clientRepository, never()).delete(any());
        verify(clientRepository, never()).deleteById(anyString());
    }

    @Test
    @DisplayName("activate deve reativar um cliente previamente desativado")
    void shouldActivateClient() {
        existingClient.setActive(false);
        when(clientRepository.findById("client-1")).thenReturn(Optional.of(existingClient));
        when(clientRepository.save(any(Client.class))).thenAnswer(invocation -> invocation.getArgument(0));

        clientService.activate("client-1");

        ArgumentCaptor<Client> captor = ArgumentCaptor.forClass(Client.class);
        verify(clientRepository).save(captor.capture());
        assertThat(captor.getValue().isActive()).isTrue();
    }

    @Test
    @DisplayName("findAll deve retornar apenas clientes ativos")
    void shouldReturnOnlyActiveClients() {
        when(clientRepository.findByIsActiveTrue()).thenReturn(List.of(existingClient));

        List<ClientResponseDTO> result = clientService.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo("client-1");
        verify(clientRepository).findByIsActiveTrue();
        verify(clientRepository, never()).findAll();
    }
}
