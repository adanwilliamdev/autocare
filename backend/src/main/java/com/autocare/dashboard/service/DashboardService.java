package com.autocare.dashboard.service;

import com.autocare.client.repository.ClientRepository;
import com.autocare.dashboard.dto.DashboardStatsDTO;
import com.autocare.inventory.repository.PartRepository;
import com.autocare.serviceorder.entity.ServiceOrderStatus;
import com.autocare.serviceorder.repository.ServiceOrderRepository;
import com.autocare.vehicle.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ClientRepository clientRepository;
    private final VehicleRepository vehicleRepository;
    private final ServiceOrderRepository serviceOrderRepository;
    private final PartRepository partRepository;

    public DashboardStatsDTO getDashboardStats() {
        var openOrders = serviceOrderRepository.findByStatusIn(
                List.of(ServiceOrderStatus.CRIADA, ServiceOrderStatus.EM_DIAGNOSTICO)
        );

        var inProgressOrders = serviceOrderRepository.findByStatus(
                ServiceOrderStatus.EM_EXECUCAO
        );

        var waitingApproval = serviceOrderRepository.findByStatus(
                ServiceOrderStatus.AGUARDANDO_APROVACAO
        );

        var lowStockItems = partRepository.findLowStockParts();

        return DashboardStatsDTO.builder()
                .totalClients(clientRepository.count())
                .totalVehicles(vehicleRepository.count())
                .totalServiceOrders(serviceOrderRepository.count())
                .openServiceOrders((long) openOrders.size())
                .inProgressServiceOrders((long) inProgressOrders.size())
                .waitingApprovalServiceOrders((long) waitingApproval.size())
                .monthlyRevenue(calculateMonthlyRevenue())
                .lowStockItems((long) lowStockItems.size())
                .monthlyRevenueChart(getMonthlyRevenueChart())
                .topMechanics(getTopMechanics())
                .mostUsedParts(getMostUsedParts())
                .build();
    }

    private BigDecimal calculateMonthlyRevenue() {
        // Implementação simplificada
        return BigDecimal.valueOf(32450.00);
    }

    private List<DashboardStatsDTO.MonthlyRevenueDTO> getMonthlyRevenueChart() {
        // Implementação simplificada
        List<DashboardStatsDTO.MonthlyRevenueDTO> chart = new ArrayList<>();
        String[] months = {"Jan", "Fev", "Mar", "Abr", "Mai", "Jun"};
        double[] values = {8500, 9200, 7800, 11200, 9800, 13450};

        for (int i = 0; i < months.length; i++) {
            chart.add(DashboardStatsDTO.MonthlyRevenueDTO.builder()
                    .month(months[i])
                    .amount(BigDecimal.valueOf(values[i]))
                    .build());
        }
        return chart;
    }

    private List<DashboardStatsDTO.TopMechanicDTO> getTopMechanics() {
        // Implementação simplificada
        return List.of(
                DashboardStatsDTO.TopMechanicDTO.builder()
                        .mechanicId("1")
                        .mechanicName("João Silva")
                        .completedOrders(45L)
                        .build(),
                DashboardStatsDTO.TopMechanicDTO.builder()
                        .mechanicId("2")
                        .mechanicName("Maria Santos")
                        .completedOrders(38L)
                        .build()
        );
    }

    private List<DashboardStatsDTO.MostUsedPartDTO> getMostUsedParts() {
        // Implementação simplificada
        return List.of(
                DashboardStatsDTO.MostUsedPartDTO.builder()
                        .partId("1")
                        .partName("Filtro de Óleo")
                        .usageCount(120L)
                        .build(),
                DashboardStatsDTO.MostUsedPartDTO.builder()
                        .partId("2")
                        .partName("Pastilha de Freio")
                        .usageCount(85L)
                        .build()
        );
    }
}