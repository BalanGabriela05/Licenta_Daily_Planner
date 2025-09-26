package com.example.demo.aichat;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GroqClient {

    private static final String GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

    @Value("${application.ai.groq.api-key}")
    private String apiKey;

    @Value("${application.ai.groq.model}")
    private String model;

    // Folosim constructor injection pentru RestTemplate
    private final RestTemplate restTemplate;
    
    private final Logger logger = LoggerFactory.getLogger(GroqClient.class);

    public String sendPrompt(String finalPrompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);

        List<Map<String, String>> messages = new ArrayList<>();
        Map<String, String> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", finalPrompt);
        messages.add(message);
        body.put("messages", messages);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(GROQ_ENDPOINT, requestEntity, String.class);
            logger.info("Groq API response: {}", response.getBody());
            return response.getBody();
        } catch (RestClientException e) {
            logger.error("Error calling Groq API: {}", e.getMessage());
            return "{\"error\": \"Error calling Groq API: " + e.getMessage() + "\"}";
        }
    }
}
