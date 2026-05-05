package com.tourism.repository;

import com.tourism.model.TourPackage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TourPackageRepository extends JpaRepository<TourPackage, Long> {
    boolean existsByName(String name);

    Optional<TourPackage> findByName(String name);
}
