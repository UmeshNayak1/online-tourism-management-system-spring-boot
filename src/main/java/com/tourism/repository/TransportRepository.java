package com.tourism.repository;

import com.tourism.model.Transport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransportRepository extends JpaRepository<Transport, Long> {
}
