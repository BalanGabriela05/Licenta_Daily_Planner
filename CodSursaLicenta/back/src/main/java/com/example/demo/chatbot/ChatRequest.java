package com.example.demo.chatbot;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ChatRequest(
  @NotBlank 
  @NotNull(message = "Prompt is required")
  String message
) {
}