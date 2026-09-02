package com.autocare.budget.repository;

import com.autocare.budget.entity.Budget;
import com.autocare.budget.entity.BudgetStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BudgetRepository extends JpaRepository<Budget, String> {
    List<Budget> findByClientId(String clientId);
    List<Budget> findByVehicleId(String vehicleId);
    List<Budget> findByStatus(BudgetStatus status);
    boolean existsByBudgetNumber(String budgetNumber);
    Budget findByBudgetNumber(String budgetNumber);
}