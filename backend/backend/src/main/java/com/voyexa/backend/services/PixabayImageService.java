package com.voyexa.backend.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class PixabayImageService {

    private static final Logger log = LoggerFactory.getLogger(PixabayImageService.class);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final String pixabayApiKey;

    public PixabayImageService(@Value("${pixabay.api-key}") String pixabayApiKey) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.pixabayApiKey = pixabayApiKey;
    }

    /**
     * Fetches a relevant image from Pixabay based on search terms.
     * @param query The search terms (e.g. "Eiffel Tower Paris")
     * @return A URL string of the image, or a fallback default image if none found.
     */
    public String fetchImageForActivity(String query) {
        if (pixabayApiKey == null || pixabayApiKey.isBlank() || pixabayApiKey.startsWith("YOUR_")) {
            log.warn("Pixabay API key not configured. Using fallback image.");
            return getDefaultImage();
        }

        try {
            // Clean up the query a bit to increase match rates
            String cleanedQuery = query.replaceAll("[^a-zA-Z0-9 ]", " ").trim();
            if (cleanedQuery.length() > 100) {
                cleanedQuery = cleanedQuery.substring(0, 100);
            }

            URI uri = UriComponentsBuilder
                    .fromUriString("https://pixabay.com/api/")
                    .queryParam("key", pixabayApiKey)
                    .queryParam("q", URLEncoder.encode(cleanedQuery, StandardCharsets.UTF_8))
                    .queryParam("image_type", "photo")
                    .queryParam("orientation", "horizontal")
                    .queryParam("per_page", 3) // Fetch a few to pick the best/first
                    .build(true)
                    .toUri();

            String response = restTemplate.getForObject(uri, String.class);
            return parseImageUrl(response);

        } catch (RestClientException e) {
            log.warn("Error calling Pixabay API for query '{}': {}", query, e.getMessage());
            return getDefaultImage();
        } catch (Exception e) {
            log.error("Unexpected error fetching image from Pixabay", e);
            return getDefaultImage();
        }
    }

    private String parseImageUrl(String jsonResponse) {
        if (jsonResponse == null || jsonResponse.isBlank()) {
            return getDefaultImage();
        }

        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            JsonNode hits = rootNode.path("hits");

            if (hits.isArray() && hits.size() > 0) {
                // Return the best quality reasonable image (largeImageURL or webformatURL)
                JsonNode firstHit = hits.get(0);
                String largeUrl = firstHit.path("largeImageURL").asText(null);
                if (largeUrl != null && !largeUrl.isEmpty()) {
                    return largeUrl;
                }
                String webUrl = firstHit.path("webformatURL").asText(null);
                if (webUrl != null && !webUrl.isEmpty()) {
                    return webUrl;
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse Pixabay response: {}", e.getMessage());
        }

        return getDefaultImage();
    }

    private String getDefaultImage() {
        // Aesthetic generic fallback if something fails
        return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=600";
    }
}
