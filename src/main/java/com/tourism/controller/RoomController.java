package com.tourism.controller;

import com.tourism.model.Room;
import com.tourism.service.CatalogService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {
    private final CatalogService catalogService;

    public RoomController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public List<Room> all() {
        return catalogService.rooms();
    }

    @GetMapping("/hotel/{hotelId}")
    public List<Room> byHotel(@PathVariable Long hotelId) {
        return catalogService.roomsByHotel(hotelId);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Room create(@RequestBody Room room) {
        return catalogService.saveRoom(room);
    }
}
