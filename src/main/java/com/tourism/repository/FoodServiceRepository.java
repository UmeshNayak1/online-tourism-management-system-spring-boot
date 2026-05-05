package com.tourism.repository;

import com.tourism.model.FoodService;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FoodServiceRepository extends JpaRepository<FoodService, Long> {
}
