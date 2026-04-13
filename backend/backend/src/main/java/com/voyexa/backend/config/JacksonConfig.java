package com.voyexa.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    /**
     * Explicitly declares the ObjectMapper as a Spring bean so that IntelliJ's
     * static analysis can resolve it during constructor injection, and so that
     * all components share the same, consistently configured instance.
     */
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}
