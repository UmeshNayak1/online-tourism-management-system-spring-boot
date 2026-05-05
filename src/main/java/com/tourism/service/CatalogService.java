package com.tourism.service;

import com.tourism.model.FoodService;
import com.tourism.model.Hotel;
import com.tourism.model.Room;
import com.tourism.model.TourPackage;
import com.tourism.model.Transport;
import com.tourism.model.Vehicle;
import com.tourism.repository.FoodServiceRepository;
import com.tourism.repository.HotelRepository;
import com.tourism.repository.RoomRepository;
import com.tourism.repository.TourPackageRepository;
import com.tourism.repository.TransportRepository;
import com.tourism.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CatalogService {
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final TourPackageRepository packageRepository;
    private final VehicleRepository vehicleRepository;
    private final FoodServiceRepository foodRepository;
    private final TransportRepository transportRepository;

    public CatalogService(
            HotelRepository hotelRepository,
            RoomRepository roomRepository,
            TourPackageRepository packageRepository,
            VehicleRepository vehicleRepository,
            FoodServiceRepository foodRepository,
            TransportRepository transportRepository
    ) {
        this.hotelRepository = hotelRepository;
        this.roomRepository = roomRepository;
        this.packageRepository = packageRepository;
        this.vehicleRepository = vehicleRepository;
        this.foodRepository = foodRepository;
        this.transportRepository = transportRepository;
    }

    public List<Hotel> hotels() {
        return hotelRepository.findAll();
    }

    public Hotel saveHotel(Hotel hotel) {
        return hotelRepository.save(hotel);
    }

    public Hotel updateHotel(Long id, Hotel input) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found"));
        hotel.setName(input.getName());
        hotel.setLocation(input.getLocation());
        hotel.setDescription(input.getDescription());
        hotel.setPrice(input.getPrice());
        return hotelRepository.save(hotel);
    }

    public void deleteHotel(Long id) {
        hotelRepository.deleteById(id);
    }

    public List<Room> rooms() {
        return roomRepository.findAll();
    }

    public List<Room> roomsByHotel(Long hotelId) {
        return roomRepository.findByHotelId(hotelId);
    }

    public Room saveRoom(Room room) {
        return roomRepository.save(room);
    }

    public List<TourPackage> packages() {
        return packageRepository.findAll();
    }

    public TourPackage savePackage(TourPackage tourPackage) {
        return packageRepository.save(tourPackage);
    }

    public TourPackage updatePackage(Long id, TourPackage input) {
        TourPackage tourPackage = packageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found"));
        tourPackage.setName(input.getName());
        tourPackage.setDestination(input.getDestination());
        tourPackage.setPrice(input.getPrice());
        tourPackage.setDuration(input.getDuration());
        tourPackage.setDescription(input.getDescription());
        tourPackage.setImageUrl(input.getImageUrl());
        return packageRepository.save(tourPackage);
    }

    public void deletePackage(Long id) {
        packageRepository.deleteById(id);
    }

    public List<Vehicle> vehicles() {
        return vehicleRepository.findAll();
    }

    public Vehicle saveVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    public List<FoodService> foodServices() {
        return foodRepository.findAll();
    }

    public FoodService saveFood(FoodService foodService) {
        return foodRepository.save(foodService);
    }

    public List<Transport> transport() {
        return transportRepository.findAll();
    }

    public Transport saveTransport(Transport transport) {
        return transportRepository.save(transport);
    }
}
