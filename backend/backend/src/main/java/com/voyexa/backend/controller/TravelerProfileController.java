package com.voyexa.backend.controller;

import com.voyexa.backend.DTOS.TravelerProfileRequestDto;
import com.voyexa.backend.DTOS.TravelerProfileResponseDto;
import com.voyexa.backend.services.TravelerProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/traveler-profiles")
public class TravelerProfileController {

    private final TravelerProfileService travelerProfileService;

    public TravelerProfileController(TravelerProfileService travelerProfileService) {
        this.travelerProfileService = travelerProfileService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TravelerProfileResponseDto>> getByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(travelerProfileService.getByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<TravelerProfileResponseDto> create(@Valid @RequestBody TravelerProfileRequestDto dto) {
        TravelerProfileResponseDto created = travelerProfileService.createProfile(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{profileId}")
    public ResponseEntity<TravelerProfileResponseDto> update(
            @PathVariable Long profileId,
            @Valid @RequestBody TravelerProfileRequestDto dto
    ) {
        return ResponseEntity.ok(travelerProfileService.updateProfile(profileId, dto));
    }

    @DeleteMapping("/{profileId}")
    public ResponseEntity<Void> delete(@PathVariable Long profileId, @RequestParam Integer userId) {
        travelerProfileService.deleteProfile(profileId, userId);
        return ResponseEntity.noContent().build();
    }
}
