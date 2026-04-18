package com.voyexa.backend.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voyexa.backend.DTOS.AlternativeGenerationRequestDto;
import com.voyexa.backend.DTOS.AlternativeGenerationResponseDto;
import com.voyexa.backend.entities.ActivityAlternative;
import com.voyexa.backend.entities.Trip;
import com.voyexa.backend.repositories.ActivityAlternativeRepository;
import com.voyexa.backend.repositories.TripRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ActivityAlternativeService {

    private static final Logger log = LoggerFactory.getLogger(ActivityAlternativeService.class);

    private final ActivityAlternativeRepository alternativeRepository;
    private final TripRepository tripRepository;
    private final ItineraryService itineraryService;
    private final ObjectMapper objectMapper;

    public ActivityAlternativeService(
            ActivityAlternativeRepository alternativeRepository,
            TripRepository tripRepository,
            ItineraryService itineraryService) {
        this.alternativeRepository = alternativeRepository;
        this.tripRepository = tripRepository;
        this.itineraryService = itineraryService;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Generate or fetch cached alternatives for a given activity.
     * If alternatives are cached and available, return them immediately.
     * Otherwise, call Gemini to generate new alternatives and cache them.
     */
    @Transactional
    public AlternativeGenerationResponseDto getAlternatives(AlternativeGenerationRequestDto requestDto) {
        log.info("Processing activity alternatives request for trip: {}, day: {}, timeSlot: {}",
                requestDto.getTripId(), requestDto.getDayNumber(), requestDto.getTimeSlot());

        // Step 1: Check if alternatives are already cached
        Optional<ActivityAlternative> cached = alternativeRepository.findByTripIdAndDayNumberAndTimeSlot(
                requestDto.getTripId(),
                requestDto.getDayNumber(),
                requestDto.getTimeSlot()
        );

        if (cached.isPresent()) {
            log.info("Returning cached alternatives for trip: {}, day: {}",
                    requestDto.getTripId(), requestDto.getDayNumber());
            return mapToResponseDto(cached.get(), true);
        }

        // Step 2: Generate new alternatives via Gemini
        log.info("Generating new alternatives via Gemini for trip: {}, day: {}",
                requestDto.getTripId(), requestDto.getDayNumber());
        List<Map<String, Object>> alternatives = generateAlternativesFromGemini(requestDto);

        // Step 3: Cache the alternatives in database
        Trip trip = tripRepository.findById(requestDto.getTripId())
                .orElseThrow(() -> new IllegalArgumentException("Trip not found: " + requestDto.getTripId()));

        ActivityAlternative activityAlt = new ActivityAlternative();
        activityAlt.setTrip(trip);
        activityAlt.setDayNumber(requestDto.getDayNumber());
        activityAlt.setTimeSlot(requestDto.getTimeSlot());
        activityAlt.setOriginalActivity(requestDto.getCurrentActivity());
        activityAlt.setAlternatives(alternatives);
        activityAlt.setSelectedIndex(-1); // -1 = original is selected

        ActivityAlternative saved = alternativeRepository.save(activityAlt);
        log.info("Cached {} alternatives for trip: {}, day: {}",
                alternatives.size(), requestDto.getTripId(), requestDto.getDayNumber());

        return mapToResponseDto(saved, false);
    }

    /**
     * Apply a selected alternative to the trip's itinerary.
     * Updates the itinerary JSON and marks which alternative is selected.
     */
    @Transactional
    public void applyAlternative(UUID tripId, Integer dayNumber, String timeSlot, Integer selectedIndex) {
        log.info("Applying alternative: tripId={}, day={}, timeSlot={}, index={}",
                tripId, dayNumber, timeSlot, selectedIndex);

        // Fetch the cached alternatives
        ActivityAlternative activityAlt = alternativeRepository.findByTripIdAndDayNumberAndTimeSlot(tripId, dayNumber, timeSlot)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No alternatives found for trip: " + tripId + ", day: " + dayNumber));

        // Update the selected index
        activityAlt.setSelectedIndex(selectedIndex);
        alternativeRepository.save(activityAlt);

        // Update the trip's itinerary JSON
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found: " + tripId));

        if (trip.getItineraryJson() != null && selectedIndex >= 0 && selectedIndex < activityAlt.getAlternatives().size()) {
            Map<String, Object> itinerary = trip.getItineraryJson();
            updateItineraryWithAlternative(itinerary, dayNumber, timeSlot, activityAlt.getAlternatives().get(selectedIndex));
            trip.setItineraryJson(itinerary);
            tripRepository.save(trip);
            log.info("Updated itinerary with alternative for trip: {}, day: {}", tripId, dayNumber);
        }
    }

    /**
     * Generate alternatives by calling Gemini with a focused prompt.
     * This is a single API call per request, minimizing rate-limit impact.
     */
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> generateAlternativesFromGemini(AlternativeGenerationRequestDto requestDto) {
        String prompt = buildAlternativeGenerationPrompt(requestDto);
        String responseJson = itineraryService.callAiModelForAlternatives(prompt);

        if (responseJson == null || responseJson.isBlank()) {
            log.warn("Gemini returned empty response for alternatives generation");
            return List.of();
        }

        // Parse the response and extract alternatives
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode alternativesNode = root.path("alternatives");
            
            if (alternativesNode.isArray()) {
                List<Map<String, Object>> result = new ArrayList<>();
                for (JsonNode alt : alternativesNode) {
                    JsonNode activity = alt.path("activity");
                    if (activity.isObject()) {
                        result.add(objectMapper.convertValue(activity, Map.class));
                        if (result.size() >= requestDto.getNumberOfAlternatives()) {
                            break;
                        }
                    }
                }
                return result;
            }
            log.warn("Response does not contain 'alternatives' array");
            return List.of();
        } catch (Exception e) {
            log.error("Failed to parse Gemini response for alternatives", e);
            return List.of();
        }
    }

    /**
     * Build a focused prompt for generating activity alternatives.
     */
    private String buildAlternativeGenerationPrompt(AlternativeGenerationRequestDto requestDto) {
        return """
                ROLE:
                You are Voyexa, an expert AI travel planner specializing in activity recommendations.

                MISSION:
                Generate %d alternative activities for a specific time slot in a travel itinerary.
                The user is seeking different options because they are not satisfied with the original activity.

                OUTPUT RULE:
                Return ONLY valid JSON. No markdown, no commentary, no extra text.

                TRIP CONTEXT:
                - Destination: %s
                - Current Activity: %s
                - Activity Description: %s
                - Time Slot: %s
                - Budget Level: %s
                - Travel Pace: %s
                - Interests: %s

                GENERATION RULES:
                - Generate %d completely different activities from the original suggestion.
                - Each alternative must be realistic and available in %s.
                - Each alternative must fit the %s time slot and budget level (%s).
                - Do not repeat the original activity or suggest minor variations.
                - Each activity should appeal to different preferences while matching the trip's budget.
                - Provide varied activity types (e.g., cultural, adventure, relaxation, food-focused).
                - Include booking search queries but keep booking links as null.
                - Do not invent fake attractions or restaurants.

                OUTPUT JSON SCHEMA:
                {
                  "alternatives": [
                    {
                      "activity": {
                        "title": "string",
                        "description": "string",
                        "location": "string",
                        "bookingInfo": {
                          "searchQuery": "string or null",
                          "bookingLink": null
                        }
                      }
                    }
                  ]
                }

                FINAL CHECK:
                - Ensure the JSON is valid and parsable.
                - Ensure exactly %d alternatives are provided.
                - Ensure variety in activity types.
                - Ensure all activities are realistic for %s.
                """.formatted(
                        requestDto.getNumberOfAlternatives(),
                        requestDto.getDestination(),
                        requestDto.getCurrentActivity().get("title"),
                        requestDto.getCurrentActivity().get("description"),
                        requestDto.getTimeSlot(),
                        requestDto.getBudget(),
                        requestDto.getTravelPace(),
                        requestDto.getInterests(),
                        requestDto.getNumberOfAlternatives(),
                        requestDto.getDestination(),
                        requestDto.getTimeSlot(),
                        requestDto.getBudget(),
                        requestDto.getNumberOfAlternatives(),
                        requestDto.getDestination()
                );
    }

    /**
     * Update the itinerary JSON with the selected alternative activity.
     */
    @SuppressWarnings("unchecked")
    private void updateItineraryWithAlternative(Map<String, Object> itinerary, Integer dayNumber, String timeSlot, Map<String, Object> newActivity) {
        try {
            JsonNode root = objectMapper.valueToTree(itinerary);
            JsonNode itineraryArray = root.path("itinerary");

            if (itineraryArray.isArray()) {
                for (JsonNode dayNode : itineraryArray) {
                    if (dayNode.path("dayNumber").asInt() == dayNumber) {
                        JsonNode timeNode = dayNode.path(timeSlot);
                        if (timeNode.isObject()) {
                            // Update the activity
                            JsonNode activityNode = timeNode.path("activity");
                            if (activityNode.isObject()) {
                                Map<String, Object> dayMap = objectMapper.convertValue(dayNode, Map.class);
                                Map<String, Object> timeMap = (Map<String, Object>) dayMap.get(timeSlot);
                                timeMap.put("activity", newActivity);
                                dayMap.put(timeSlot, timeMap);

                                // Update in the main itinerary map
                                List<Map<String, Object>> itineraryList = (List<Map<String, Object>>) itinerary.get("itinerary");
                                itineraryList.set(dayNumber - 1, dayMap);
                            }
                        }
                        break;
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to update itinerary with alternative activity", e);
        }
    }

    /**
     * Map ActivityAlternative entity to response DTO.
     */
    private AlternativeGenerationResponseDto mapToResponseDto(ActivityAlternative entity, boolean isCached) {
        return AlternativeGenerationResponseDto.builder()
                .alternativeId(entity.getId())
                .dayNumber(entity.getDayNumber())
                .timeSlot(entity.getTimeSlot())
                .originalActivity(entity.getOriginalActivity())
                .alternatives(entity.getAlternatives())
                .selectedIndex(entity.getSelectedIndex())
                .isCached(isCached)
                .build();
    }
}



