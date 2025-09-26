package com.example.demo.chatbot;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Component;

import com.example.demo.chatbot.date.DateRange;
import com.example.demo.chatbot.history.ConversationHistoryFormatter;
import com.example.demo.chatbot.history.ConversationHistoryService;
import com.example.demo.chatbot.util.EventFormatter;
import com.example.demo.event.Event;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ConversationManager {

    private final ConversationHistoryService historyService;

    public String buildPrompt(Integer userId, String userMessage, List<Event> events, DateRange range, String context) {
        switch (context.toLowerCase()) {
            case "organizational":
                return buildOrganizationalPrompt(userId, userMessage, events, range);
            case "prioritization":
                return buildPrioritizationPrompt(userId, userMessage, events, range);
            case "recommendation":
                return buildReccomendationPrompt(userId, userMessage, events, range);
            case "general":
                return buildGeneralPrompt(userId, userMessage);
            case "specific":
                return buildSpecificPrompt(userId, userMessage, events);
            default:
                throw new IllegalArgumentException("Unknown context: " + context);
        }
    }

    private StringBuilder initializePrompt() {
        StringBuilder prompt = new StringBuilder();
    
        // Intro
        prompt.append("You are a personal assistant designed to help the user organize their time effectively.\n")
                .append("Respond strictly to the user's question only.\n\n");
    
        prompt.append("IMPORTANT: If the user asks about another person's events, schedule, or personal information, ")
        .append("you must not provide any details. Instead, respond politely and inform the user that this information is not accessible due to privacy and security policies.\n\n");
        
        // Date
        LocalDate today = LocalDate.now();
        prompt.append("Today's date is ").append(today).append(", ").append(today.getDayOfWeek()).append(".\n");
    
        return prompt;
    }

    private String buildOrganizationalPrompt(Integer userId, String userMessage, List<Event> events, DateRange range) {
        StringBuilder prompt = initializePrompt();
        if (range != null) {
            prompt.append("The user is asking for assistance regarding their schedule from ")
                    .append(range.from()).append(" to ").append(range.to()).append(".\n\n");
        }
        prompt.append("Here are the user's scheduled events:\n");
        prompt.append(EventFormatter.formatEvents(events));
        prompt.append("\nThis is the conversation history so far:\n");
        prompt.append(ConversationHistoryFormatter.formatHistory(historyService.getHistory(userId)));
        prompt.append("\nThe user's latest message is: \"").append(userMessage).append("\".\n");
        prompt.append("\nBased on the user's schedule, the conversation history, and their latest message, provide a helpful and actionable response.");
        return prompt.toString();
    }

    private String buildPrioritizationPrompt(Integer userId, String userMessage, List<Event> events, DateRange range) {
        StringBuilder prompt = initializePrompt();
        if (range != null) {
            prompt.append("The user is asking about prioritized events within the time range from ")
                    .append(range.from()).append(" to ").append(range.to()).append(".\n\n");
        }
        prompt.append("Here are the user's prioritized events:\n");
        prompt.append(EventFormatter.formatEventsWithPriority(events));
        prompt.append("\nThis is the conversation history so far:\n");
        prompt.append(ConversationHistoryFormatter.formatHistory(historyService.getHistory(userId)));
        prompt.append("\nThe user's latest message is: \"").append(userMessage).append("\".\n");
        prompt.append("\nBased on the user's prioritized events, the conversation history, and their latest message, provide a helpful and actionable response.");
        return prompt.toString();
    }

    private String buildReccomendationPrompt(Integer userId, String userMessage, List<Event> events, DateRange range) {
        StringBuilder prompt = initializePrompt();
        if (range != null) {
            prompt.append("The user is asking about recommendations or productivity within the time range from ")
                    .append(range.from()).append(" to ").append(range.to()).append(".\n\n");
        }
        if (!events.isEmpty()) {
            prompt.append("Here are the user's scheduled events:\n");
            prompt.append(EventFormatter.formatEvents(events));
        } else {
            prompt.append("The user has no scheduled events during this time.\n");
        }
        prompt.append("\nThis is the conversation history so far:\n");
        prompt.append(ConversationHistoryFormatter.formatHistory(historyService.getHistory(userId)));
        prompt.append("\nThe user's latest message is: \"").append(userMessage).append("\".\n");
        prompt.append("\nProvide a clear and actionable response to the user's question. Ask follow-up questions about their personal preferences and available time.");
        return prompt.toString();
    }

    private String buildSpecificPrompt(Integer userId, String userMessage, List<Event> events) {
        StringBuilder prompt = initializePrompt();
        prompt.append("The user is asking about a specific event.\n\n");
        if (events != null && !events.isEmpty()) {
            prompt.append("Here are the events related to the user's query:\n");
            prompt.append(EventFormatter.formatEvents(events));
        } else {
            prompt.append("No events were found related to the user's query.\n");
        }
        prompt.append("\nThis is the conversation history so far:\n");
        prompt.append(ConversationHistoryFormatter.formatHistory(historyService.getHistory(userId)));
        prompt.append("\nThe user's latest message is: \"").append(userMessage).append("\".\n");
        prompt.append("\nBased on the user's query and the relevant events, provide a helpful and actionable response.");
        return prompt.toString();
    }

    private String buildGeneralPrompt(Integer userId, String userMessage) {
        StringBuilder prompt = initializePrompt();
        prompt.append("\nThis is the conversation history so far:\n");
        prompt.append(ConversationHistoryFormatter.formatHistory(historyService.getHistory(userId)));
        prompt.append("\nThe user's latest message is: \"").append(userMessage).append("\".\n");
        prompt.append("\nProvide a clear and concise response to the user's question that is unrelated to your role, politely inform the user.");
        return prompt.toString();
    }
}
