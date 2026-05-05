package com.tourism.controller;

import com.tourism.dto.BookingRequest;
import com.tourism.model.Booking;
import com.tourism.model.BookingStatus;
import com.tourism.service.BookingService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public Booking create(@RequestBody BookingRequest request) {
        return bookingService.create(request);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Booking> all() {
        return bookingService.findAll();
    }

    @GetMapping("/user/{id}")
    public List<Booking> byUser(@PathVariable Long id) {
        return bookingService.findByUser(id);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public Booking updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return bookingService.updateStatus(id, BookingStatus.valueOf(body.get("status")));
    }
}
