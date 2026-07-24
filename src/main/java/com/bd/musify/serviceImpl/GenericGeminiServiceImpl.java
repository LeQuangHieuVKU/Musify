package com.bd.musify.serviceImpl;

import com.bd.musify.service.GenericGeminiService;
import com.google.genai.Client;
import com.google.genai.errors.ClientException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

@Service
public class GenericGeminiServiceImpl implements GenericGeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GenericGeminiServiceImpl.class);

    @Value("${gemimi.api.key}")
    private String geminiApiKey;

    @Value("${gemini.models}")
    private String geminiModels;

    private final ObjectMapper objectMapper;

    public GenericGeminiServiceImpl(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public <T> T generateContent(String prompt, Class<T> responseType) {
        if (prompt == null || prompt.trim().isEmpty()) {
            throw new IllegalArgumentException("Prompt cannot be null or empty");
        }

        Client client = new Client.Builder()
                .apiKey(geminiApiKey)
                .build();
        String[] models = geminiModels.split(",");
        Exception lastException = null;

        for (int i = 0; i <= models.length; i++) {
            try {
                logger.info("Calling Gemini API with model: {} ({}/{})", models[i].trim(), i+1, models.length);
                String responese = client.models.generateContent(models[i].trim(), prompt,null).text();

                if (responese == null || responese.isEmpty()) {
                    throw new IllegalArgumentException("Response cannot be null or empty");
                }

                return parseResponse(responese,responseType);
            } catch (ClientException e){
                if (e.getMessage() != null && e.getMessage().contains("429")){
                    logger.warn("Rate limit exceeded for {}. Trying next model if available.", models[i].trim());
                    lastException = e;

                    if (i < models.length -1 ) {
                        continue;
                    }else {
                        throw new RuntimeException("Gemini API error: " + e.getMessage(), lastException);
                    }
                }
            }
        }

        throw new RuntimeException("All models exhausted due to rate limited", lastException);
    }

    private <T> T parseResponse(String responese, Class<T> responseType) {
        if (responseType == String.class) {
            return responseType.cast(responese);
        }

        try {
            String json = responese.trim();
            if (json.startsWith("```json")) json = json.substring(7);
            else if (json.startsWith("```")) json = json.substring(3);
            if (json.endsWith("```")) json = json.substring(0, json.length()-3);
            return objectMapper.readValue(json.trim(), responseType);
        } catch (Exception e) {
            throw new RuntimeException("Failed parsing response: " + e.getMessage(), e);
        }
    }
}
