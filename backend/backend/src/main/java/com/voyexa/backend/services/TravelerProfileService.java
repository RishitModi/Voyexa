package com.voyexa.backend.services;

import com.voyexa.backend.DTOS.TravelerProfileRequestDto;
import com.voyexa.backend.DTOS.TravelerProfileResponseDto;
import com.voyexa.backend.entities.TravelerProfile;
import com.voyexa.backend.entities.User;
import com.voyexa.backend.repositories.TravelerProfileRepository;
import com.voyexa.backend.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

@Service
public class TravelerProfileService {

    private static final Set<String> ALLOWED_RELATIONS = Set.of("self", "spouse", "child", "parent", "friend", "other");
    private static final Set<String> ALLOWED_GENDERS = Set.of("male", "female", "other");
    private static final Set<String> ALLOWED_DIETARY = Set.of("veg", "non_veg", "vegan");
    private static final Set<String> ALLOWED_MOBILITY = Set.of("none", "limited_walking", "wheelchair", "elderly_friendly");

    private final TravelerProfileRepository travelerProfileRepository;
    private final UserRepository userRepository;

    public TravelerProfileService(TravelerProfileRepository travelerProfileRepository, UserRepository userRepository) {
        this.travelerProfileRepository = travelerProfileRepository;
        this.userRepository = userRepository;
    }

    public List<TravelerProfileResponseDto> getByUserId(Integer userId) {
        return travelerProfileRepository.findByUserId(userId).stream().map(this::toResponse).toList();
    }

    public TravelerProfileResponseDto createProfile(TravelerProfileRequestDto dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        TravelerProfile profile = new TravelerProfile();
        profile.setUser(user);
        applyUpdates(profile, dto);
        TravelerProfile saved = travelerProfileRepository.save(profile);
        return toResponse(saved);
    }

    public TravelerProfileResponseDto updateProfile(Long profileId, TravelerProfileRequestDto dto) {
        TravelerProfile profile = travelerProfileRepository.findById(profileId)
                .orElseThrow(() -> new IllegalArgumentException("Traveler profile not found."));

        if (profile.getUser().getUser_id() != dto.getUserId()) {
            throw new IllegalArgumentException("Profile does not belong to the specified user.");
        }

        applyUpdates(profile, dto);
        TravelerProfile saved = travelerProfileRepository.save(profile);
        return toResponse(saved);
    }

    public void deleteProfile(Long profileId, Integer userId) {
        TravelerProfile profile = travelerProfileRepository.findById(profileId)
                .orElseThrow(() -> new IllegalArgumentException("Traveler profile not found."));

        if (profile.getUser().getUser_id() != userId) {
            throw new IllegalArgumentException("Profile does not belong to the specified user.");
        }

        travelerProfileRepository.delete(profile);
    }

    private void applyUpdates(TravelerProfile profile, TravelerProfileRequestDto dto) {
        profile.setName(dto.getName().trim());
        profile.setRelation(normalizeOptionalEnum(dto.getRelation(), ALLOWED_RELATIONS, "relation"));
        profile.setDob(dto.getDob());
        profile.setGender(normalizeOptionalEnum(dto.getGender(), ALLOWED_GENDERS, "gender"));
        profile.setDietaryPreferences(normalizeOptionalEnum(dto.getDietaryPreferences(), ALLOWED_DIETARY, "dietaryPreferences"));
        profile.setMobilityLevel(normalizeOptionalEnum(dto.getMobilityLevel(), ALLOWED_MOBILITY, "mobilityLevel"));
        profile.setNationality(normalizeOptionalText(dto.getNationality()));
        profile.setInterests(dto.getInterests() == null ? List.of() : dto.getInterests().stream()
                .map(this::normalizeOptionalText)
                .filter(s -> s != null && !s.isBlank())
                .toList());
    }

    private String normalizeOptionalEnum(String value, Set<String> allowed, String fieldName) {
        String normalized = normalizeOptionalText(value);
        if (normalized == null) {
            return null;
        }
        String lowered = normalized.toLowerCase(Locale.ROOT);
        if (!allowed.contains(lowered)) {
            throw new IllegalArgumentException("Invalid " + fieldName + " value.");
        }
        return lowered;
    }

    private String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isBlank() ? null : trimmed;
    }

    private TravelerProfileResponseDto toResponse(TravelerProfile profile) {
        return new TravelerProfileResponseDto(
                profile.getId(),
                profile.getUser().getUser_id(),
                profile.getName(),
                profile.getRelation(),
                profile.getDob(),
                profile.getGender(),
                profile.getDietaryPreferences(),
                profile.getMobilityLevel(),
                profile.getNationality(),
                profile.getInterests(),
                profile.getCreatedAt()
        );
    }
}
