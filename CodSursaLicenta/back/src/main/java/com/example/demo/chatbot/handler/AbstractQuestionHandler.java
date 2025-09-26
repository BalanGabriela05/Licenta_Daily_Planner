package com.example.demo.chatbot.handler;

import java.util.List;

import com.example.demo.chatbot.ConversationManager;
import com.example.demo.chatbot.GroqAi;
import com.example.demo.chatbot.date.DateParserService;
import com.example.demo.chatbot.date.DateRange;
import com.example.demo.chatbot.history.ConversationHistoryService;
import com.example.demo.event.Event;
import com.example.demo.user.User;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public abstract class AbstractQuestionHandler implements QuestionHandler {

    protected final RelevantEventService relevantEventService;
    protected final ConversationManager conversationManager;
    protected final GroqAi groqClient;
    protected final ConversationHistoryService historyService;
    protected final DateParserService dateParserService;

    @Override
    public abstract boolean canHandle(String text);

    @Override
    public String handle(User user, String text) {
        // Extragem intervalul de timp din mesaj
        DateRange range = dateParserService.parseDateRange(text);
        if (range == null) {
            range = DateRange.getDefaultDateRange();
        }

        // Obținem evenimentele relevante
        List<Event> events = getRelevantEvents(user, text, range);

        // Construim promptul pentru AI
        String context = getContext();

        String prompt = conversationManager.buildPrompt(user.getId(), text, events, range, context);

        // Obținem răspunsul de la AI
        String aiResponse = groqClient.ask(prompt);

        // Salvăm răspunsul în istoricul conversației
        historyService.saveAIResponse(user.getId(), aiResponse);

        return aiResponse;
    }

    protected List<Event> getRelevantEvents(User user, String text, DateRange range) {
        return relevantEventService.getAllRelevantEvents(user, range.from(), range.to());
    }

    protected abstract String getContext();
}