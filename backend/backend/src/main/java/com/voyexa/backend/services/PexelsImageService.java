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
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class PexelsImageService {

    private static final Logger log = LoggerFactory.getLogger(PexelsImageService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String pexelsApiKey;

    public PexelsImageService(@Value("${pexels.api-key:YOUR_PEXELS_API_KEY}") String pexelsApiKey) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.pexelsApiKey = pexelsApiKey;
    }

    /**
     * Fetches a relevant image from Pexels based on search terms.
     * @param query The search terms (e.g. "Eiffel Tower Paris")
     * @return A URL string of the image, or a fallback default image if none found.
     */
    public String fetchImageForActivity(String query) {
        if (pexelsApiKey == null || pexelsApiKey.isBlank() || pexelsApiKey.startsWith("YOUR_")) {
            log.warn("Pexels API key not configured. Using fallback image.");
            return getDefaultImage();
        }

        try {
            // Clean up the query a bit to increase match rates
            String cleanedQuery = query.replaceAll("[^a-zA-Z0-9 ]", " ").trim();
            if (cleanedQuery.length() > 100) {
                cleanedQuery = cleanedQuery.substring(0, 100);
            }

            URI uri = UriComponentsBuilder
                    .fromUriString("https://api.pexels.com/v1/search")
                    .queryParam("query", URLEncoder.encode(cleanedQuery, StandardCharsets.UTF_8))
                    .queryParam("orientation", "landscape")
                    .queryParam("per_page", 3) // Fetch a few to pick the best/first
                    .build(true)
                    .toUri();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", pexelsApiKey);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
            return parseImageUrl(response.getBody());

        } catch (RestClientException e) {
            log.warn("Error calling Pexels API for query '{}': {}", query, e.getMessage());
            return getDefaultImage();
        } catch (Exception e) {
            log.error("Unexpected error fetching image from Pexels", e);
            return getDefaultImage();
        }
    }

    private String parseImageUrl(String jsonResponse) {
        if (jsonResponse == null || jsonResponse.isBlank()) {
            return getDefaultImage();
        }

        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            JsonNode photos = rootNode.path("photos");

            if (photos.isArray() && photos.size() > 0) {
                // Return a reasonably sized image
                JsonNode firstHit = photos.get(0);
                JsonNode src = firstHit.path("src");
                
                String largeUrl = src.path("large").asText(null);
                if (largeUrl != null && !largeUrl.isEmpty()) {
                    return largeUrl;
                }
                String mediumUrl = src.path("medium").asText(null);
                if (mediumUrl != null && !mediumUrl.isEmpty()) {
                    return mediumUrl;
                }
                String originalUrl = src.path("original").asText(null);
                if (originalUrl != null && !originalUrl.isEmpty()) {
                    return originalUrl;
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse Pexels response: {}", e.getMessage());
        }

        return getDefaultImage();
    }

    private String getDefaultImage() {
        // Aesthetic generic fallback if something fails
        return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=600";
    }
}
