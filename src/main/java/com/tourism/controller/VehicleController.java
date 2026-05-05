package com.tourism.controller;

import com.tourism.model.Vehicle;
import com.tourism.service.CatalogService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {
    private final CatalogService catalogService;

    public VehicleController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public List<Vehicle> all() {
        return catalogService.vehicles();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Vehicle create(@RequestBody Vehicle vehicle) {
        return catalogService.saveVehicle(vehicle);
    }
}
