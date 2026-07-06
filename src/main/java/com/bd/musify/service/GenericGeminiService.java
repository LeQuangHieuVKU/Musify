package com.bd.musify.service;

public interface GenericGeminiService {
    <T> T generateContent(String prompt, Class<T> responseType);
}
