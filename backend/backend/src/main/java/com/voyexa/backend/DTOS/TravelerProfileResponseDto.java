package com.voyexa.backend.DTOS;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Getter
@AllArgsConstructor
public class TravelerProfileResponseDto {
    private Long id;
    private Integer userId;
    private String name;
    private String relation;
    private LocalDate dob;
    private String gender;
    private String dietaryPreferences;
    private String mobilityLevel;
    private String nationality;
    private List<String> interests;
    private Instant createdAt;
}
