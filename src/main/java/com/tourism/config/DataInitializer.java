package com.tourism.config;

import com.tourism.model.FoodService;
import com.tourism.model.Hotel;
import com.tourism.model.Role;
import com.tourism.model.TourPackage;
import com.tourism.model.Transport;
import com.tourism.model.User;
import com.tourism.model.Vehicle;
import com.tourism.repository.FoodServiceRepository;
import com.tourism.repository.HotelRepository;
import com.tourism.repository.TourPackageRepository;
import com.tourism.repository.TransportRepository;
import com.tourism.repository.UserRepository;
import com.tourism.repository.VehicleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner seedData(
            UserRepository userRepository,
            TourPackageRepository packageRepository,
            HotelRepository hotelRepository,
            VehicleRepository vehicleRepository,
            FoodServiceRepository foodRepository,
            TransportRepository transportRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            if (!userRepository.existsByEmail("admin@tourism.com")) {
                User admin = new User();
                admin.setName("System Admin");
                admin.setEmail("admin@tourism.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setPhone("9999999999");
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);
            }

            seedPackage(packageRepository, "Goa Beach Holiday", "Goa", "4 Days / 3 Nights", "14999",
                    "Beach stay, sightseeing, cruise, and local food experience.",
                    "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80");
            seedPackage(packageRepository, "Dubai International Tour", "Dubai", "5 Days / 4 Nights", "59999",
                    "City tour, desert safari, shopping, and Burj Khalifa visit.",
                    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80");
            seedPackage(packageRepository, "Kerala Backwater Escape", "Kerala", "5 Days / 4 Nights", "21999",
                    "Houseboat stay, Alleppey backwaters, Munnar hills, and local cuisine.",
                    "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80");
            seedPackage(packageRepository, "Manali Mountain Adventure", "Manali", "6 Days / 5 Nights", "25999",
                    "Snow viewpoints, Solang Valley, river activities, and mountain resort stay.",
                    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80");
            seedPackage(packageRepository, "Jaipur Heritage Trail", "Jaipur", "3 Days / 2 Nights", "12999",
                    "Amber Fort, City Palace, local markets, cultural dinner, and guided sightseeing.",
                    "https://images.unsplash.com/photo-1599661046827-dacde6976549?auto=format&fit=crop&w=1200&q=80");
            seedPackage(packageRepository, "Singapore City Lights", "Singapore", "5 Days / 4 Nights", "54999",
                    "Sentosa, Gardens by the Bay, city tour, shopping, and night safari.",
                    "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80");

            seedHotel(hotelRepository, "Ocean View Resort", "Goa", "Premium beach-side hotel with breakfast included.", "3500");
            seedHotel(hotelRepository, "Palm Grove Stay", "Goa", "Comfortable mid-range hotel near beaches and local markets.", "2400");
            seedHotel(hotelRepository, "Backwater Pearl Houseboat", "Kerala", "Private houseboat stay with meals and backwater cruise.", "6200");
            seedHotel(hotelRepository, "Munnar Hill Retreat", "Kerala", "Mountain-view resort with tea garden access.", "4200");
            seedHotel(hotelRepository, "Snow Valley Lodge", "Manali", "Cozy hill hotel close to Mall Road and adventure points.", "3800");
            seedHotel(hotelRepository, "Royal Heritage Haveli", "Jaipur", "Heritage-style stay near forts and city attractions.", "4600");
            seedHotel(hotelRepository, "Marina Bay Comfort Inn", "Singapore", "City hotel with metro access and breakfast.", "7800");
            seedHotel(hotelRepository, "Desert Star Hotel", "Dubai", "Modern hotel with city transfers and family rooms.", "8500");

            seedVehicle(vehicleRepository, "Toyota Innova", "SUV", "2500", true);
            seedVehicle(vehicleRepository, "Maruti Ertiga", "MPV", "1900", true);
            seedVehicle(vehicleRepository, "Tempo Traveller 12 Seater", "Group Van", "5200", true);
            seedVehicle(vehicleRepository, "Volvo Tourist Coach", "Luxury Bus", "12000", true);
            seedVehicle(vehicleRepository, "Royal Enfield Himalayan", "Bike", "1400", true);
            seedVehicle(vehicleRepository, "Toyota Fortuner", "Premium SUV", "4800", true);
            seedVehicle(vehicleRepository, "Airport Sedan", "Sedan", "1700", true);
            seedVehicle(vehicleRepository, "Mini Bus 21 Seater", "Mini Bus", "7800", true);

            if (foodRepository.count() == 0) {
                FoodService food = new FoodService();
                food.setName("Veg Meal Plan");
                food.setType("Vegetarian");
                food.setPrice(new BigDecimal("700"));
                foodRepository.save(food);
            }

            if (transportRepository.count() == 0) {
                Transport transport = new Transport();
                transport.setType("Bus");
                transport.setSource("Mumbai");
                transport.setDestination("Goa");
                transport.setPrice(new BigDecimal("1200"));
                transportRepository.save(transport);
            }
        };
    }

    private void seedPackage(
            TourPackageRepository packageRepository,
            String name,
            String destination,
            String duration,
            String price,
            String description,
            String imageUrl
    ) {
        if (packageRepository.existsByName(name)) {
            packageRepository.findByName(name).ifPresent(existing -> {
                if (existing.getImageUrl() == null || existing.getImageUrl().isBlank()) {
                    existing.setImageUrl(imageUrl);
                    packageRepository.save(existing);
                }
            });
            return;
        }

        TourPackage tourPackage = new TourPackage();
        tourPackage.setName(name);
        tourPackage.setDestination(destination);
        tourPackage.setDuration(duration);
        tourPackage.setPrice(new BigDecimal(price));
        tourPackage.setDescription(description);
        tourPackage.setImageUrl(imageUrl);
        packageRepository.save(tourPackage);
    }

    private void seedHotel(
            HotelRepository hotelRepository,
            String name,
            String location,
            String description,
            String price
    ) {
        if (hotelRepository.existsByName(name)) {
            hotelRepository.findByName(name).ifPresent(existing -> {
                existing.setLocation(location);
                existing.setDescription(description);
                existing.setPrice(new BigDecimal(price));
                hotelRepository.save(existing);
            });
            return;
        }

        Hotel hotel = new Hotel();
        hotel.setName(name);
        hotel.setLocation(location);
        hotel.setDescription(description);
        hotel.setPrice(new BigDecimal(price));
        hotelRepository.save(hotel);
    }

    private void seedVehicle(
            VehicleRepository vehicleRepository,
            String name,
            String type,
            String price,
            boolean available
    ) {
        if (vehicleRepository.existsByName(name)) {
            vehicleRepository.findByName(name).ifPresent(existing -> {
                existing.setType(type);
                existing.setPrice(new BigDecimal(price));
                existing.setAvailable(available);
                vehicleRepository.save(existing);
            });
            return;
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setName(name);
        vehicle.setType(type);
        vehicle.setPrice(new BigDecimal(price));
        vehicle.setAvailable(available);
        vehicleRepository.save(vehicle);
    }
}
