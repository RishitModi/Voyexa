package com.voyexa.backend.controller;

import com.voyexa.backend.DTOS.DestinationDto;
import com.voyexa.backend.services.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * Get trending destinations for the current month
     */
    @GetMapping("/trending")
    public ResponseEntity<List<DestinationDto>> getTrendingDestinations() {
        List<DestinationDto> trending = dashboardService.getTrendingDestinationsMonth();
        return ResponseEntity.ok(trending);
    }

    /**
     * Get trending destinations for a specific month
     * Example: /api/dashboard/trending?month=MAY
     */
    @GetMapping("/trending-by-month")
    public ResponseEntity<List<DestinationDto>> getTrendingByMonth(@RequestParam String month) {
        List<DestinationDto> trending = dashboardService.getTrendingDestinationsByMonth(month.toUpperCase());
        return ResponseEntity.ok(trending);
    }

    /**
     * Get all available months with trending data
     */
    @GetMapping("/trending-months")
    public ResponseEntity<List<String>> getAvailableMonths() {
        List<String> months = dashboardService.getAllAvailableMonths();
        return ResponseEntity.ok(months);
    }
}

