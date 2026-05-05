package com.tourism.controller;

import com.tourism.model.Transport;
import com.tourism.service.CatalogService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/transport")
public class TransportController {
    private final CatalogService catalogService;

    public TransportController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    public List<Transport> all() {
        return catalogService.transport();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Transport create(@RequestBody Transport transport) {
        return catalogService.saveTransport(transport);
    }
}
