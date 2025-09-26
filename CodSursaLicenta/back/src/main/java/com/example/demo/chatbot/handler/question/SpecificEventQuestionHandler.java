package com.example.demo.chatbot.handler.question;
import java.util.List;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.example.demo.chatbot.ConversationManager;
import com.example.demo.chatbot.GroqAi;
import com.example.demo.chatbot.date.DateParserService;
import com.example.demo.chatbot.handler.AbstractQuestionHandler;
import com.example.demo.chatbot.handler.RelevantEventService;
import com.example.demo.chatbot.history.ConversationHistoryService;
import com.example.demo.event.Event;
import com.example.demo.user.User;

@Order(4)
@Component
public class SpecificEventQuestionHandler extends AbstractQuestionHandler {

    public SpecificEventQuestionHandler(RelevantEventService relevantEventService,
                                        ConversationManager conversationManager,
                                        GroqAi groqClient,
                                        ConversationHistoryService historyService,
                                        DateParserService dateParserService) {
        super(relevantEventService, conversationManager, groqClient, historyService, dateParserService);
    }

    @Override
    public boolean canHandle(String text) {
        return text.matches(
            "(?i)" +
            "(?=.*\\b(?:when)\\b)" +
            ".*"
        );
    }
    
    @Override
    public String handle(User user, String text) {
        // Căutăm evenimente relevante în titlu
        List<Event> relevantEvents = relevantEventService.searchEventsByTitle(user.getId(), text);

        // Afișăm evenimentele găsite (pentru debugging)
        for (Event event : relevantEvents) {
            System.out.println("Found event: " + event.getTitle() + " at " + event.getStartTime());
        }

        // Dacă nu găsim evenimente relevante
        if (relevantEvents.isEmpty()) {
            return "I couldn't find any events related to your query.";
        }

        // Construim promptul pentru AI
        String context = getContext();

        String prompt = conversationManager.buildPrompt(user.getId(), text, relevantEvents, null, context);

        // Obținem răspunsul de la AI
        String aiResponse = groqClient.ask(prompt);

        // Salvăm răspunsul în istoricul conversației
        historyService.saveAIResponse(user.getId(), aiResponse);

        return aiResponse;
    }

    @Override
    protected String getContext() {
        return "specific";
    }
}