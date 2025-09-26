package com.example.demo.aichat;


import org.springframework.stereotype.Service;
@Service
public class IntentDetectorService {

    public String detectAction(String prompt) {
        String lowerCasePrompt = prompt.toLowerCase();
        
        if (lowerCasePrompt.matches(".*\\b(add|schedule|create|new)\\b.*\\b(event)\\b.*")) {
            return "create_event";
        } else if (lowerCasePrompt.matches(".*\\b((add|create|new)\\b.*\\b(calendar)\\b.*")) {
            return "create_calendar";
        } else if (lowerCasePrompt.matches(".*\\b(recommend|organize|better)\\b.*\\b(week|schedule|time|organize)\\b.*")) {
            return "schedule_advice";
        }
        return "unknown";
    }
}