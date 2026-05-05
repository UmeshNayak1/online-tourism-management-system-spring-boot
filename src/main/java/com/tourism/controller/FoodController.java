package com.tourism.controller;

import com.tourism.model.FoodService;
import com.tourism.service.CatalogService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/food")
public class FoodController {
    private final CatalogService catalogService;

    public FoodController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public List<FoodService> all() {
        return catalogService.foodServices();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public FoodService create(@RequestBody FoodService foodService) {
        return catalogService.saveFood(foodService);
    }
}
