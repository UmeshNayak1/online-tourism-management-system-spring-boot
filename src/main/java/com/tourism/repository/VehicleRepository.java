package com.tourism.repository;

import com.tourism.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    boolean existsByName(String name);

    Optional<Vehicle> findByName(String name);
}
