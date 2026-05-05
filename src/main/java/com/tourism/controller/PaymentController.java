package com.tourism.controller;

import com.tourism.dto.PaymentRequest;
import com.tourism.model.Payment;
import com.tourism.service.PaymentService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public Payment create(@RequestBody PaymentRequest request) {
        return paymentService.create(request);
    }

    @GetMapping("/user/{id}")
    public List<Payment> byUser(@PathVariable Long id) {
        return paymentService.findByUser(id);
    }
}
