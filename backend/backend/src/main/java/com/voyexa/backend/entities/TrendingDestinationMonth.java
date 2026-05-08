package com.voyexa.backend.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "trending_destinations_by_month", indexes = {
    @Index(name = "idx_month_rank", columnList = "month, rank")
})
public class TrendingDestinationMonth {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "month", nullable = false, length = 20)
    private String month;  // JANUARY, FEBRUARY, ..., DECEMBER

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "country", nullable = false, length = 100)
    private String country;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "budget")
    private Integer budget;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Column(name = "rank")
    private Integer rank;  // 1-10 ranking for the month

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt;

    public TrendingDestinationMonth() {}

    public TrendingDestinationMonth(String month, String city, String country, String description,
                                    Integer budget, String imageUrl, Integer rank) {
        this.month = month;
        this.city = city;
        this.country = country;
        this.description = description;
        this.budget = budget;
        this.imageUrl = imageUrl;
        this.rank = rank;
        this.generatedAt = LocalDateTime.now();
    }
}

