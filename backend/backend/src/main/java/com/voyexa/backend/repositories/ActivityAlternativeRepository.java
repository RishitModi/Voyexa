package com.voyexa.backend.repositories;

import com.voyexa.backend.entities.ActivityAlternative;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ActivityAlternativeRepository extends JpaRepository<ActivityAlternative, UUID> {

    /**
     * Find alternatives for a specific activity in a trip.
     */
    Optional<ActivityAlternative> findByTripIdAndDayNumberAndTimeSlot(UUID tripId, Integer dayNumber, String timeSlot);

    /**
     * Find all alternatives for a specific trip.
     */
    List<ActivityAlternative> findByTripId(UUID tripId);

    /**
     * Delete all alternatives for a trip (useful when trip is deleted).
     */
    void deleteByTripId(UUID tripId);
}

