package com.voyexa.backend.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voyexa.backend.DTOS.AlternativeGenerationResponseDto;
import com.voyexa.backend.DTOS.OnDemandAlternativeRequestDto;
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
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class OnDemandAlternativeService {

    private static final Logger log = LoggerFactory.getLogger(OnDemandAlternativeService.class);
    private static final Set<String> VALID_TIME_SLOTS = Set.of("morning", "afternoon", "evening");

    private final ActivityAlternativeRepository alternativeRepository;
    private final TripRepository tripRepository;
    private final ItineraryService itineraryService;
    private final ObjectMapper objectMapper;

    public OnDemandAlternativeService(
            ActivityAlternativeRepository alternativeRepository,
            TripRepository tripRepository,
            ItineraryService itineraryService) {
        this.alternativeRepository = alternativeRepository;
        this.tripRepository = tripRepository;
        this.itineraryService = itineraryService;
        this.objectMapper = new ObjectMapper();
    }

    @Transactional
    public AlternativeGenerationResponseDto getAlternatives(UUID tripId, OnDemandAlternativeRequestDto requestDto) {
        String normalizedTimeSlot = normalizeTimeSlot(requestDto.getTimeSlot());
        Optional<ActivityAlternative> cached = alternativeRepository.findByTripIdAndDayNumberAndTimeSlot(
                tripId,
                requestDto.getDayNumber(),
                normalizedTimeSlot
        );

        if (cached.isPresent()) {
            return mapToResponseDto(cached.get(), true);
        }

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found: " + tripId));

        List<Map<String, Object>> generatedAlternatives = generateAlternatives(trip, requestDto, normalizedTimeSlot);

        ActivityAlternative entity = new ActivityAlternative();
        entity.setTrip(trip);
        entity.setDayNumber(requestDto.getDayNumber());
        entity.setTimeSlot(normalizedTimeSlot);
        entity.setOriginalActivity(requestDto.getCurrentActivity());
        entity.setAlternatives(generatedAlternatives);
        entity.setSelectedIndex(-1);

        ActivityAlternative saved = alternativeRepository.save(entity);
        return mapToResponseDto(saved, false);
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> generateAlternatives(
            Trip trip,
            OnDemandAlternativeRequestDto requestDto,
            String normalizedTimeSlot) {
        String prompt = buildPrompt(trip, requestDto, normalizedTimeSlot);
        String responseJson = itineraryService.callAiModelForAlternatives(prompt);
        if (responseJson == null || responseJson.isBlank()) {
            return List.of();
        }

        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode alternativesNode = root.path("alternatives");
            if (!alternativesNode.isArray()) {
                return List.of();
            }

            List<Map<String, Object>> result = new ArrayList<>();
            for (JsonNode candidate : alternativesNode) {
                JsonNode activityNode = candidate.path("activity");
                if (activityNode.isObject()) {
                    result.add(objectMapper.convertValue(activityNode, Map.class));
                } else if (candidate.isObject()) {
                    result.add(objectMapper.convertValue(candidate, Map.class));
                }

                if (result.size() >= requestDto.getNumberOfAlternatives()) {
                    break;
                }
            }

            return result;
        } catch (Exception e) {
            log.error("Failed to parse Gemini alternatives response for trip {}", trip.getId(), e);
            return List.of();
        }
    }

    private String buildPrompt(Trip trip, OnDemandAlternativeRequestDto requestDto, String normalizedTimeSlot) {
        String destination = defaultText(trip.getDestination(), "destination");
        String budget = defaultText(trip.getBudget(), "moderate");
        String travelPace = defaultText(trip.getTripPace(), "balanced");
        String interests = trip.getInterests() == null || trip.getInterests().length == 0
                ? "none"
                : String.join(", ", trip.getInterests());
        String dayContextJson = toCompactJson(requestDto.getDayContext());

        return """
                ROLE:
                You are Voyexa, an expert AI travel planner.

                MISSION:
                Generate %d alternatives for exactly one activity slot in a day itinerary.

                OUTPUT RULE:
                Return ONLY valid JSON. No markdown and no extra text.

                CONTEXT:
                - Destination: %s
                - Budget: %s
                - Travel Pace: %s
                - Interests: %s
                - Day Number: %d
                - Time Slot: %s
                - Current Activity Title: %s
                - Current Activity Description: %s
                - Current Activity Location: %s
                - Full Day JSON Context: %s

                RULES:
                - Produce alternatives only for the requested time slot.
                - Keep alternatives realistic for the destination and budget.
                - Ensure alternatives are materially different from the current activity.
                - Do not repeat activities already present in the provided day JSON context.
                - Keep the same response structure for each alternative activity.
                - Include "imageQuery" in every activity as a one-line photo search phrase with place + scene.
                - bookingInfo.bookingLink must be null.

                RESPONSE SCHEMA:
                {
                  "alternatives": [
                    {
                      "activity": {
                        "title": "string",
                        "description": "string",
                        "location": "string",
                        "imageQuery": "string",
                        "bookingInfo": {
                          "searchQuery": "string or null",
                          "bookingLink": null
                        }
                      }
                    }
                  ]
                }
                """.formatted(
                requestDto.getNumberOfAlternatives(),
                destination,
                budget,
                travelPace,
                interests,
                requestDto.getDayNumber(),
                normalizedTimeSlot,
                defaultText((String) requestDto.getCurrentActivity().get("title"), "Activity"),
                defaultText((String) requestDto.getCurrentActivity().get("description"), ""),
                defaultText((String) requestDto.getCurrentActivity().get("location"), destination),
                dayContextJson
        );
    }

    private String toCompactJson(Map<String, Object> value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            return "{}";
        }
    }

    private String defaultText(String value, String fallback) {
        return (value == null || value.isBlank()) ? fallback : value;
    }

    private String normalizeTimeSlot(String raw) {
        String normalized = raw == null ? "" : raw.trim().toLowerCase(Locale.ROOT);
        if (!VALID_TIME_SLOTS.contains(normalized)) {
            throw new IllegalArgumentException("Invalid time slot: " + raw);
        }
        return normalized;
    }

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
