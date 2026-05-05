package com.tourism.service;

import com.tourism.dto.BookingRequest;
import com.tourism.model.Booking;
import com.tourism.model.BookingStatus;
import com.tourism.repository.BookingRepository;
import com.tourism.repository.HotelRepository;
import com.tourism.repository.TourPackageRepository;
import com.tourism.repository.UserRepository;
import com.tourism.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final TourPackageRepository packageRepository;
    private final HotelRepository hotelRepository;
    private final VehicleRepository vehicleRepository;

    public BookingService(
            BookingRepository bookingRepository,
            UserRepository userRepository,
            TourPackageRepository packageRepository,
            HotelRepository hotelRepository,
            VehicleRepository vehicleRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.packageRepository = packageRepository;
        this.hotelRepository = hotelRepository;
        this.vehicleRepository = vehicleRepository;
    }

    public Booking create(BookingRequest request) {
        Booking booking = new Booking();
        booking.setUser(userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found")));
        if (request.packageId() != null) {
            booking.setTourPackage(packageRepository.findById(request.packageId())
                    .orElseThrow(() -> new ResourceNotFoundException("Package not found")));
        }
        if (request.hotelId() != null) {
            booking.setHotel(hotelRepository.findById(request.hotelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Hotel not found")));
        }
        if (request.vehicleId() != null) {
            booking.setVehicle(vehicleRepository.findById(request.vehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found")));
        }
        booking.setCurrentLocation(request.currentLocation());
        booking.setNumberOfPeople(request.numberOfPeople());
        booking.setCustomerNote(request.customerNote());
        booking.setStatus(BookingStatus.PENDING);
        return bookingRepository.save(booking);
    }

    public List<Booking> findAll() {
        return bookingRepository.findAll();
    }

    public List<Booking> findByUser(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    public Booking updateStatus(Long id, BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }
}
