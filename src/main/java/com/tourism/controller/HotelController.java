package com.tourism.controller;

import com.tourism.model.Hotel;
import com.tourism.service.CatalogService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/hotels")
public class HotelController {
    private final CatalogService catalogService;

    public HotelController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public List<Hotel> all() {
        return catalogService.hotels();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Hotel create(@Valid @RequestBody Hotel hotel) {
        return catalogService.saveHotel(hotel);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Hotel update(@PathVariable Long id, @RequestBody Hotel hotel) {
        return catalogService.updateHotel(id, hotel);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        catalogService.deleteHotel(id);
    }
}
