package com.voyexa.backend.DTOS;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OnDemandAlternativeRequestDto {

    @NotNull
    @Min(1)
    private Integer dayNumber;

    @NotNull
    private String timeSlot; // "morning", "afternoon", "evening"

    @NotNull
    private Map<String, Object> currentActivity;

    @NotNull
    private Map<String, Object> dayContext;

    @NotNull
    @Min(2)
    private Integer numberOfAlternatives;
}
