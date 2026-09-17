package com.autocare.serviceorder.service;

import com.autocare.auth.entity.Role;
import com.autocare.auth.entity.User;
import com.autocare.client.entity.Client;
import com.autocare.client.service.ClientService;
import com.autocare.mechanic.entity.Mechanic;
import com.autocare.mechanic.repository.MechanicRepository;
import com.autocare.mechanic.service.MechanicService;
import com.autocare.serviceorder.dto.ServiceOrderRequestDTO;
import com.autocare.serviceorder.dto.ServiceOrderResponseDTO;
import com.autocare.serviceorder.dto.StatusUpdateRequestDTO;
import com.autocare.serviceorder.entity.ServiceOrder;
import com.autocare.serviceorder.entity.ServiceOrderStatus;
import com.autocare.serviceorder.repository.ServiceOrderRepository;
import com.autocare.shared.exception.BusinessException;
import com.autocare.vehicle.entity.Vehicle;
import com.autocare.vehicle.service.VehicleService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ServiceOrderService")
class ServiceOrderServiceTest {

    @Mock
    private ServiceOrderRepository serviceOrderRepository;
    @Mock
    private ClientService clientService;
    @Mock
    private VehicleService vehicleService;
    @Mock
    private MechanicService mechanicService;
    @Mock
    private MechanicRepository mechanicRepository;

    @InjectMocks
    private ServiceOrderService serviceOrderService;

    private Client client;
    private Vehicle vehicle;
    private Mechanic mechanic;

    @BeforeEach
    void setUp() {
        client = Client.builder().id("client-1").name("João").build();
        vehicle = Vehicle.builder().id("vehicle-1").plate("ABC1234").brand("Fiat").model("Uno").build();
        mechanic = Mechanic.builder().id("mechanic-1").userId("user-mechanic-1").name("Carlos").build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(Role role, String userId) {
        User user = User.builder().id(userId).email(userId + "@autocare.com").role(role).isActive(true).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities())
        );
    }

    @Test
    @DisplayName("create deve gerar o número da OS a partir da sequence do banco (não de count())")
    void shouldGenerateOrderNumberFromSequence() {
        ServiceOrderRequestDTO request = ServiceOrderRequestDTO.builder()
                .clientId("client-1")
                .vehicleId("vehicle-1")
                .reportedProblem("Barulho no motor")
                .build();

        when(clientService.findById("client-1")).thenReturn(client);
        when(vehicleService.findById("vehicle-1")).thenReturn(vehicle);
        when(serviceOrderRepository.nextOrderSequenceValue()).thenReturn(42L);
        when(serviceOrderRepository.save(any(ServiceOrder.class))).thenAnswer(inv -> {
            ServiceOrder so = inv.getArgument(0);
            so.setId("order-1");
            return so;
        });

        ServiceOrderResponseDTO response = serviceOrderService.create(request);

        // Confirma que o número usa o valor atômico da sequence, não uma contagem de linhas.
        assertThat(response.getOrderNumber()).endsWith("000042");
        verify(serviceOrderRepository).nextOrderSequenceValue();
        verify(serviceOrderRepository, never()).count();
    }

    @Test
    @DisplayName("updateStatus deve permitir uma transição válida (CRIADA -> EM_DIAGNOSTICO)")
    void shouldAllowValidStatusTransition() {
        authenticateAs(Role.ADMIN, "admin-1");

        ServiceOrder order = ServiceOrder.builder()
                .id("order-1")
                .client(client)
                .vehicle(vehicle)
                .status(ServiceOrderStatus.CRIADA)
                .build();

        when(serviceOrderRepository.findById("order-1")).thenReturn(Optional.of(order));
        when(serviceOrderRepository.save(any(ServiceOrder.class))).thenAnswer(inv -> inv.getArgument(0));

        StatusUpdateRequestDTO request = StatusUpdateRequestDTO.builder()
                .status(ServiceOrderStatus.EM_DIAGNOSTICO)
                .diagnosis("Verificando correia")
                .build();

        ServiceOrderResponseDTO response = serviceOrderService.updateStatus("order-1", request);

        assertThat(response.getStatus()).isEqualTo(ServiceOrderStatus.EM_DIAGNOSTICO);
        assertThat(response.getDiagnosis()).isEqualTo("Verificando correia");
    }

    @Test
    @DisplayName("updateStatus deve rejeitar uma transição inválida (CRIADA -> FINALIZADA)")
    void shouldRejectInvalidStatusTransition() {
        authenticateAs(Role.ADMIN, "admin-1");

        ServiceOrder order = ServiceOrder.builder()
                .id("order-1")
                .client(client)
                .vehicle(vehicle)
                .status(ServiceOrderStatus.CRIADA)
                .build();

        when(serviceOrderRepository.findById("order-1")).thenReturn(Optional.of(order));

        StatusUpdateRequestDTO request = StatusUpdateRequestDTO.builder()
                .status(ServiceOrderStatus.FINALIZADA)
                .build();

        assertThatThrownBy(() -> serviceOrderService.updateStatus("order-1", request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Transição de status inválida");

        verify(serviceOrderRepository, never()).save(any());
    }

    @Test
    @DisplayName("um MECHANIC deve conseguir ver a OS atribuída a ele")
    void mechanicShouldAccessOwnOrder() {
        authenticateAs(Role.MECHANIC, "user-mechanic-1");

        ServiceOrder order = ServiceOrder.builder()
                .id("order-1")
                .client(client)
                .vehicle(vehicle)
                .mechanic(mechanic)
                .status(ServiceOrderStatus.EM_DIAGNOSTICO)
                .build();

        when(serviceOrderRepository.findById("order-1")).thenReturn(Optional.of(order));
        when(mechanicRepository.findByUserId("user-mechanic-1")).thenReturn(Optional.of(mechanic));

        ServiceOrderResponseDTO response = serviceOrderService.findByIdResponse("order-1");

        assertThat(response.getId()).isEqualTo("order-1");
    }

    @Test
    @DisplayName("um MECHANIC NÃO deve conseguir ver a OS de outro mecânico (403)")
    void mechanicShouldNotAccessOtherMechanicOrder() {
        authenticateAs(Role.MECHANIC, "user-mechanic-2");

        Mechanic otherMechanic = Mechanic.builder().id("mechanic-2").userId("user-mechanic-2").name("Outro").build();

        ServiceOrder order = ServiceOrder.builder()
                .id("order-1")
                .client(client)
                .vehicle(vehicle)
                .mechanic(mechanic) // atribuída ao mechanic-1, não ao mechanic-2
                .status(ServiceOrderStatus.EM_DIAGNOSTICO)
                .build();

        when(serviceOrderRepository.findById("order-1")).thenReturn(Optional.of(order));
        when(mechanicRepository.findByUserId("user-mechanic-2")).thenReturn(Optional.of(otherMechanic));

        assertThatThrownBy(() -> serviceOrderService.findByIdResponse("order-1"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("um MECHANIC sem perfil vinculado deve ser bloqueado")
    void mechanicWithoutLinkedProfileShouldBeDenied() {
        authenticateAs(Role.MECHANIC, "user-without-profile");

        ServiceOrder order = ServiceOrder.builder()
                .id("order-1")
                .client(client)
                .vehicle(vehicle)
                .mechanic(mechanic)
                .status(ServiceOrderStatus.EM_DIAGNOSTICO)
                .build();

        when(serviceOrderRepository.findById("order-1")).thenReturn(Optional.of(order));
        when(mechanicRepository.findByUserId("user-without-profile")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> serviceOrderService.findByIdResponse("order-1"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("assignMechanic deve vincular o mecânico à OS")
    void shouldAssignMechanicToOrder() {
        ServiceOrder order = ServiceOrder.builder()
                .id("order-1")
                .client(client)
                .vehicle(vehicle)
                .status(ServiceOrderStatus.CRIADA)
                .build();

        when(serviceOrderRepository.findById("order-1")).thenReturn(Optional.of(order));
        when(mechanicService.findById("mechanic-1")).thenReturn(mechanic);
        when(serviceOrderRepository.save(any(ServiceOrder.class))).thenAnswer(inv -> inv.getArgument(0));

        ServiceOrderResponseDTO response = serviceOrderService.assignMechanic("order-1", "mechanic-1");

        assertThat(response.getMechanicId()).isEqualTo("mechanic-1");
        assertThat(response.getMechanicName()).isEqualTo("Carlos");
    }
}
