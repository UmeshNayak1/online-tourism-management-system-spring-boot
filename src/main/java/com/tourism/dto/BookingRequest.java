package com.tourism.dto;

public record BookingRequest(
        Long userId,
        Long packageId,
        Long hotelId,
        Long vehicleId,
        String currentLocation,
        Integer numberOfPeople,
        String customerNote
) {
}
