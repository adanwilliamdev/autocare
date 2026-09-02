package com.autocare.mechanic.repository;

import com.autocare.mechanic.entity.Mechanic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MechanicRepository extends JpaRepository<Mechanic, String> {
    List<Mechanic> findByIsAvailableTrue();
    List<Mechanic> findByIsActiveTrue();
}