package com.tourism.controller;

import com.tourism.repository.BookingRepository;
import com.tourism.repository.HotelRepository;
import com.tourism.repository.TourPackageRepository;
import com.tourism.repository.UserRepository;
import com.tourism.repository.VehicleRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final TourPackageRepository packageRepository;
    private final HotelRepository hotelRepository;
    private final VehicleRepository vehicleRepository;

    public AdminController(
            UserRepository userRepository,
            BookingRepository bookingRepository,
            TourPackageRepository packageRepository,
            HotelRepository hotelRepository,
            VehicleRepository vehicleRepository
    ) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.packageRepository = packageRepository;
        this.hotelRepository = hotelRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @GetMapping("/dashboard")
    public Map<String, Long> dashboard() {
        return Map.of(
                "users", userRepository.count(),
                "bookings", bookingRepository.count(),
                "packages", packageRepository.count(),
                "hotels", hotelRepository.count(),
                "vehicles", vehicleRepository.count()
        );
    }
}
