package com.tourism.dto;

import com.tourism.model.PaymentStatus;

import java.math.BigDecimal;

public record PaymentRequest(
        Long userId,
        Long bookingId,
        BigDecimal amount,
        PaymentStatus paymentStatus
) {
}
