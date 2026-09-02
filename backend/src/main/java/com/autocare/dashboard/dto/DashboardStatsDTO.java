package com.autocare.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private Long totalClients;
    private Long totalVehicles;
    private Long totalServiceOrders;
    private Long openServiceOrders;
    private Long inProgressServiceOrders;
    private Long waitingApprovalServiceOrders;
    private BigDecimal monthlyRevenue;
    private Long lowStockItems;
    private List<MonthlyRevenueDTO> monthlyRevenueChart;
    private List<TopMechanicDTO> topMechanics;
    private List<MostUsedPartDTO> mostUsedParts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyRevenueDTO {
        private String month;
        private BigDecimal amount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopMechanicDTO {
        private String mechanicId;
        private String mechanicName;
        private Long completedOrders;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MostUsedPartDTO {
        private String partId;
        private String partName;
        private Long usageCount;
    }
}
