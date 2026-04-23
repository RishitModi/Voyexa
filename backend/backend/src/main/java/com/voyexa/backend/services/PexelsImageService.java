package com.voyexa.backend.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PexelsImageService {

    private static final Logger log = LoggerFactory.getLogger(PexelsImageService.class);
    private static final String SEARCH_URL = "https://api.pexels.com/v1/search";
    private static final int PER_PAGE = 1;
    private static final Set<String> TITLE_STOP_WORDS = Set.of(
            "a", "an", "the", "to", "at", "in", "on", "for", "of", "and", "or",
            "visit", "explore", "discover", "experience", "enjoy", "walk", "stroll"
    );

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String pexelsApiKey;

    public PexelsImageService(@Value("${pexels.api-key:YOUR_PEXELS_API_KEY}") String pexelsApiKey) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.pexelsApiKey = pexelsApiKey;
    }

    /**
     * Backward-compatible entrypoint that treats the input as a prebuilt query.
     */
    public String fetchImageForActivity(String query) {
        return fetchImageForActivity(query, "");
    }

    public String fetchImageForActivity(String titleOrQuery, String location) {
        if (pexelsApiKey == null || pexelsApiKey.isBlank() || pexelsApiKey.startsWith("YOUR_")) {
            log.warn("Pexels API key not configured. Using fallback image.");
            return getDefaultImage();
        }

        try {
            String primaryQuery = buildQuery(titleOrQuery, location);
            String primaryResponse = callPexels(primaryQuery);
            String primaryUrl = extractFirstImageUrl(primaryResponse);
            if (primaryUrl != null) {
                return primaryUrl;
            }

            String fallbackQuery = sanitizeForQuery(location);
            if (!fallbackQuery.isBlank()) {
                String fallbackResponse = callPexels(fallbackQuery + " travel");
                String fallbackUrl = extractFirstImageUrl(fallbackResponse);
                if (fallbackUrl != null) {
                    return fallbackUrl;
                }
            }

            return getDefaultImage();

        } catch (RestClientException e) {
            log.warn("Error calling Pexels API for query='{}', location='{}': {}", titleOrQuery, location, e);
            return getDefaultImage();
        } catch (Exception e) {
            log.error("Unexpected error fetching image from Pexels", e);
            return getDefaultImage();
        }
    }

    List<String> buildSearchQueries(String rawTitleOrQuery, String rawLocation) {
        String query = sanitizeForQuery(rawTitleOrQuery);
        String location = sanitizeForQuery(rawLocation);
        String simplified = simplifyTitle(query);

        LinkedHashSet<String> ordered = new LinkedHashSet<>();
        if (!query.isBlank() && !location.isBlank()) {
            ordered.add(query + " " + location);
        } else if (!query.isBlank()) {
            ordered.add(query);
        } else if (!location.isBlank()) {
            ordered.add(location + " travel");
        }

        if (!simplified.isBlank()) {
            if (!location.isBlank()) {
                ordered.add(simplified + " " + location);
            }
            ordered.add(simplified);
        }

        if (!location.isBlank()) {
            ordered.add(location + " travel");
        }

        if (ordered.isEmpty()) {
            ordered.add("travel destination");
        }

        return new ArrayList<>(ordered);
    }

    private String callPexels(String query) {
        URI uri = UriComponentsBuilder
                .fromUriString(SEARCH_URL)
                .queryParam("query", query)
                .queryParam("orientation", "landscape")
                .queryParam("per_page", PER_PAGE)
                .build()
                .toUri();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", pexelsApiKey);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
        return response.getBody();
    }

    private String extractFirstImageUrl(String jsonResponse) {
        if (jsonResponse == null || jsonResponse.isBlank()) {
            return null;
        }

        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            JsonNode photos = rootNode.path("photos");
            if (!photos.isArray() || photos.isEmpty()) {
                return null;
            }
            JsonNode firstPhoto = photos.get(0);
            return pickBestSrcUrl(firstPhoto.path("src"));
        } catch (Exception e) {
            log.warn("Failed to parse Pexels response: {}", e.getMessage());
            return null;
        }
    }

    private String pickBestSrcUrl(JsonNode src) {
        String large2xUrl = src.path("large2x").asText(null);
        if (isNotBlank(large2xUrl)) {
            return large2xUrl;
        }

        String largeUrl = src.path("large").asText(null);
        if (isNotBlank(largeUrl)) {
            return largeUrl;
        }

        String mediumUrl = src.path("medium").asText(null);
        if (isNotBlank(mediumUrl)) {
            return mediumUrl;
        }

        String originalUrl = src.path("original").asText(null);
        if (isNotBlank(originalUrl)) {
            return originalUrl;
        }

        return null;
    }

    String buildQuery(String rawTitleOrQuery, String rawLocation) {
        String query = sanitizeForQuery(rawTitleOrQuery);
        String location = sanitizeForQuery(rawLocation);

        if (!query.isBlank() && !location.isBlank()) {
            return query + " " + location;
        }
        if (!query.isBlank()) {
            return query;
        }
        if (!location.isBlank()) {
            return location + " travel";
        }
        return "travel destination";
    }

    private String simplifyTitle(String title) {
        if (title == null || title.isBlank()) {
            return "";
        }

        String simplified = Arrays.stream(title.split("\\s+"))
                .map(token -> token.toLowerCase(Locale.ROOT))
                .filter(token -> !TITLE_STOP_WORDS.contains(token))
                .collect(Collectors.joining(" "));

        return simplified.isBlank() ? title : simplified;
    }

    private String sanitizeForQuery(String text) {
        if (text == null) {
            return "";
        }
        String cleaned = text.replaceAll("[^a-zA-Z0-9 ]", " ").replaceAll("\\s+", " ").trim();
        return cleaned.length() > 100 ? cleaned.substring(0, 100).trim() : cleaned;
    }

    private boolean isNotBlank(String value) {
        return value != null && !value.isBlank();
    }

    private String getDefaultImage() {
        // Aesthetic generic fallback if something fails
        return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=600";
    }
}
