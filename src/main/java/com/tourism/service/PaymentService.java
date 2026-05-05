package com.tourism.service;

import com.tourism.dto.PaymentRequest;
import com.tourism.model.Payment;
import com.tourism.model.PaymentStatus;
import com.tourism.repository.BookingRepository;
import com.tourism.repository.PaymentRepository;
import com.tourism.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public PaymentService(PaymentRepository paymentRepository, UserRepository userRepository, BookingRepository bookingRepository) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

    public Payment create(PaymentRequest request) {
        Payment payment = new Payment();
        payment.setUser(userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found")));
        if (request.bookingId() != null) {
            payment.setBooking(bookingRepository.findById(request.bookingId())
                    .orElseThrow(() -> new ResourceNotFoundException("Booking not found")));
        }
        payment.setAmount(request.amount());
        payment.setPaymentStatus(request.paymentStatus() == null ? PaymentStatus.SUCCESS : request.paymentStatus());
        return paymentRepository.save(payment);
    }

    public List<Payment> findByUser(Long userId) {
        return paymentRepository.findByUserId(userId);
    }
}
