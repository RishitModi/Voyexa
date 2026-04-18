package com.voyexa.backend.DTOS;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class TravelerProfileRequestDto {
    @NotNull
    private Integer userId;

    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 20)
    private String relation;

    private LocalDate dob;

    @Size(max = 10)
    private String gender;

    @Size(max = 20)
    private String dietaryPreferences;

    @Size(max = 30)
    private String mobilityLevel;

    @Size(max = 50)
    private String nationality;

    @NotNull
    private List<String> interests = new ArrayList<>();
}
