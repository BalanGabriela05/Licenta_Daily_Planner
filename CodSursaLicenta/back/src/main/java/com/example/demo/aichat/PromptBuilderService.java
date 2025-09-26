package com.example.demo.aichat;

import org.springframework.stereotype.Service;

@Service
public class PromptBuilderService {

    public String buildPrompt(String action, String rawPrompt) {
        switch (action) {
            case "create_event":
            return "Based on the provided sentence: \"" + rawPrompt + "\", extract the following event details and return only a valid JSON with the exact structure below. " +
            "Each attribute must be extracted specifically as follows: " +
            "- `title` (string): A concise and short summary of the event. For example, if the sentence contains 'Add an event titled interview job', the title should be 'interview job'. " +
            "- `description` (string): Additional details or context about the event. For example, if the sentence contains 'I have to do take an interview', the description should be 'I have to do take an interview'. " +
            "- `startTime` (string): The starting time of the event in ISO-8601 format (\"YYYY-MM-DDTHH:MM:SS\"). " +
            "- `endTime` (string): The ending time of the event in ISO-8601 format (\"YYYY-MM-DDTHH:MM:SS\"). " +
            "- `calendarName` (string): The calendar name where the event should be added. " +
            "The JSON must strictly follow this structure: " +
            "{ " +
            "  \"action\": \"create_event\", " +
            "  \"data\": { " +
            "    \"title\": \"string\", " +
            "    \"description\": \"string\", " +
            "    \"startTime\": \"YYYY-MM-DDTHH:MM:SS\", " +
            "    \"endTime\": \"YYYY-MM-DDTHH:MM:SS\", " +
            "    \"calendarName\": string " +
            "  } " +
            "}. " +
            "If any required detail is missing or cannot be extracted, return a JSON with a single key 'error' and an appropriate error message explaining what is missing. " +
            "Return only the raw JSON without any extra text or explanations.";
    // alte cazuri ...
            default:
                throw new IllegalArgumentException("Unknown action: " + action);
        }
    }
}

