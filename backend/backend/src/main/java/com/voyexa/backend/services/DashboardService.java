package com.voyexa.backend.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voyexa.backend.DTOS.DestinationDto;
import com.voyexa.backend.entities.TrendingDestinationMonth;
import com.voyexa.backend.repositories.TrendingDestinationMonthRepository;
import com.voyexa.backend.services.gemini.GeminiClient;
import com.voyexa.backend.services.gemini.GeminiTask;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardService {

    private static final Logger log = LoggerFactory.getLogger(DashboardService.class);

    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;
    private final TrendingDestinationMonthRepository trendingDestinationMonthRepository;
    private final PexelsImageService pexelsImageService;

    public DashboardService(GeminiClient geminiClient, TrendingDestinationMonthRepository trendingDestinationMonthRepository, PexelsImageService pexelsImageService) {
        this.geminiClient = geminiClient;
        this.trendingDestinationMonthRepository = trendingDestinationMonthRepository;
        this.pexelsImageService = pexelsImageService;
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Get trending destinations for the current month
     */
    public List<DestinationDto> getTrendingDestinationsMonth() {
        String currentMonth = LocalDate.now().getMonth().name(); // E.g., "MAY"
        return getTrendingDestinationsByMonth(currentMonth);
    }

    /**
     * Get trending destinations for a specific month
     */
    public List<DestinationDto> getTrendingDestinationsByMonth(String month) {
        log.info("Fetching trending destinations for month: {}", month);

        // Check if we have this month in database
        if (trendingDestinationMonthRepository.existsByMonth(month)) {
            List<TrendingDestinationMonth> entities = trendingDestinationMonthRepository.findByMonthOrderByRank(month);
            if (!entities.isEmpty()) {
                log.info("Found {} destinations for {} in database", entities.size(), month);
                return convertEntitiesToDtos(entities);
            }
        }

        // Cache miss - generate from Gemini API
        log.info("Cache miss for month {}. Fetching from Gemini API...", month);
        String prompt = buildPrompt(month);
        String jsonResponse = callAiModel(prompt);

        if (jsonResponse != null) {
            try {
                List<DestinationDto> destinations = objectMapper.readValue(jsonResponse, new TypeReference<List<DestinationDto>>() {});
                
                // Fetch proper Pexels images based on destination
                for (DestinationDto dto : destinations) {
                    dto.setImageUrl(generatePexelsImageUrl(dto));
                }

                // Save to database
                saveDestinationsToDatabase(month, destinations);
                return destinations;

            } catch (JsonProcessingException e) {
                log.error("Failed to parse Gemini response for trending destinations: {}", e.getMessage());
            }
        }

        log.warn("No trending destinations available for month: {}", month);
        return List.of();
    }

    /**
     * Fetch image from Pexels API based on destination
     */
    private String generatePexelsImageUrl(DestinationDto dto) {
        try {
            // Use Gemini's search term if provided, otherwise use city name
            String searchTerm = (dto.getImageSearchTerm() != null && !dto.getImageSearchTerm().isEmpty())
                ? dto.getImageSearchTerm()
                : dto.getCity();

            String imageUrl = pexelsImageService.fetchImageForActivity(searchTerm, dto.getCountry());
            log.info("Fetched image from Pexels for: {} -> {}", searchTerm, imageUrl);
            return imageUrl;
        } catch (Exception e) {
            log.warn("Error fetching image from Pexels for {}: {}", dto.getCity(), e.getMessage());
            // Return a fallback image from a free source
            return "https://images.pexels.com/photos/3408831/pexels-photo-3408831.jpeg";
        }
    }

    /**
     * Get all available months with trending data
     */
    public List<String> getAllAvailableMonths() {
        return trendingDestinationMonthRepository.findAllMonths();
    }

    /**
     * Generate trending destinations for all 12 months (typically called once on startup)
     */
    public void generateAllMonthsIfMissing() {
        String[] months = {"JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
                          "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"};

        for (String month : months) {
            if (!trendingDestinationMonthRepository.existsByMonth(month)) {
                log.info("Generating trending destinations for {}", month);
                getTrendingDestinationsByMonth(month);
                try {
                    // Small delay to avoid hammering the API
                    Thread.sleep(1000);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            }
        }
    }

    /**
     * Save destinations to database
     */
    @Transactional
    private void saveDestinationsToDatabase(String month, List<DestinationDto> destinations) {
        try {
            // Delete existing records for this month
            trendingDestinationMonthRepository.deleteByMonth(month);

            // Save new records
            for (int i = 0; i < destinations.size(); i++) {
                DestinationDto dto = destinations.get(i);
                TrendingDestinationMonth entity = new TrendingDestinationMonth(
                    month,
                    dto.getCity(),
                    dto.getCountry(),
                    dto.getDescription(),
                    dto.getBudget(),
                    dto.getImageUrl(),
                    i + 1  // rank from 1-10
                );
                trendingDestinationMonthRepository.save(entity);
            }
            log.info("Saved {} destinations for {} to database", destinations.size(), month);
        } catch (Exception e) {
            log.error("Failed to save destinations to database: {}", e.getMessage());
        }
    }

    /**
     * Convert database entities to DTOs
     */
    private List<DestinationDto> convertEntitiesToDtos(List<TrendingDestinationMonth> entities) {
        List<DestinationDto> dtos = new ArrayList<>();
        for (TrendingDestinationMonth entity : entities) {
            DestinationDto dto = new DestinationDto();
            dto.setCity(entity.getCity());
            dto.setCountry(entity.getCountry());
            dto.setDescription(entity.getDescription());
            dto.setBudget(entity.getBudget());
            dto.setImageUrl(entity.getImageUrl());
            dtos.add(dto);
        }
        return dtos;
    }

    private String buildPrompt(String month) {
        return """
                ROLE:
                You are Voyexa, an expert AI travel planner.

                MISSION:
                Identify the top 10 hottest, most highly recommended travel destinations globally for the month of %s.

                OUTPUT RULE:
                A strict JSON array. No markdown, no explanations, no code block backticks. 
                Just start with '[' and end with ']'.

                JSON FORMAT:
                [
                  {
                    "city": "string (the city name)",
                    "country": "string (the country name)",
                    "description": "string (a catchy 1-sentence reason why it's trending this month)",
                    "budget": numeric (integer, reasonable estimated cost for a 5-day solo trip in USD),
                    "imageSearchTerm": "string (2-3 word search term for beautiful stock photos, e.g., 'tokyo cherry blossoms', 'paris spring', 'dubai desert sunset')"
                  }
                ]
                """.formatted(month);
    }

    private String callAiModel(String prompt) {
        log.info("Calling Gemini API for trending destinations...");
        try {
            return geminiClient.generateContent(prompt, GeminiTask.AUXILIARY);
        } catch (Exception e) {
            log.error("Error calling Gemini API for trending destinations: {}", e.getMessage());
            return null;
        }
    }}
