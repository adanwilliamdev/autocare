package com.autocare.vehicle.repository;

import com.autocare.vehicle.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, String> {
    Optional<Vehicle> findByPlate(String plate);
    List<Vehicle> findByClientId(String clientId);
    List<Vehicle> findByClientIdAndIsActiveTrue(String clientId);
    boolean existsByPlate(String plate);
}