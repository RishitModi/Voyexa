package com.voyexa.backend.DTOS;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Map;
import java.util.UUID;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AlternativeGenerationRequestDto {

    @NotNull
    private UUID tripId;

    @NotNull
    @Min(1)
    private Integer dayNumber;

    @NotNull
    private String timeSlot; // "morning", "afternoon", "evening"

    @NotNull
    private Map<String, Object> currentActivity;

    @NotNull
    @Min(2)
    private Integer numberOfAlternatives; // 2-3 alternatives

    // Trip context for generating relevant alternatives
    @NotNull
    private String destination;

    @NotNull
    private String budget;

    private String interests; // comma-separated list of interests

    private String travelPace; // "relaxed", "balanced", "packed"

    private String tripSummary; // trip summary for context
}

