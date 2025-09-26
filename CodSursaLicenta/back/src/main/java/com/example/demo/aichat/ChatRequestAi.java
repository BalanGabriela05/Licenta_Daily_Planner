package com.example.demo.aichat;

import jakarta.validation.constraints.NotNull;


public record ChatRequestAi(
  @NotNull(message = "Prompt is required")
  String prompt
  ) 
  {}
