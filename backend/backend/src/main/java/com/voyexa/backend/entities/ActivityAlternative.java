package com.voyexa.backend.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "activity_alternatives", indexes = {
    @Index(name = "idx_trip_day_timeslot", columnList = "trip_id,day_number,time_slot")
})
public class ActivityAlternative {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "trip_id", nullable = false)
    private Trip trip;

    @NotNull
    @Column(name = "day_number", nullable = false)
    private Integer dayNumber;

    @NotNull
    @Column(name = "time_slot", nullable = false, length = 20)
    private String timeSlot; // "morning", "afternoon", "evening"

    // Original activity as JSON
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "original_activity", columnDefinition = "jsonb")
    private Map<String, Object> originalActivity;

    // Array of alternative activities (JSON)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "alternatives", columnDefinition = "jsonb")
    private List<Map<String, Object>> alternatives;

    // Index of the currently selected alternative (null = original is selected, 0 = first alternative, etc.)
    @Column(name = "selected_index")
    private Integer selectedIndex;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
        if (selectedIndex == null) {
            selectedIndex = -1; // -1 means original activity is selected
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }
}

