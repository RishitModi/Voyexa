package com.voyexa.backend.DTOS;

import lombok.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AlternativeGenerationResponseDto {

    private UUID alternativeId;

    private Integer dayNumber;

    private String timeSlot;

    private Map<String, Object> originalActivity;

    private List<Map<String, Object>> alternatives;

    private Integer selectedIndex; // -1 = original, 0+ = alternative index

    private Boolean isCached; // true if fetched from cache, false if freshly generated
}

