package com.example.demo.chatbot.handler.question;

import java.util.List;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.example.demo.chatbot.ConversationManager;
import com.example.demo.chatbot.GroqAi;
import com.example.demo.chatbot.date.DateParserService;
import com.example.demo.chatbot.date.DateRange;
import com.example.demo.chatbot.handler.AbstractQuestionHandler;
import com.example.demo.chatbot.handler.RelevantEventService;
import com.example.demo.chatbot.history.ConversationHistoryService;
import com.example.demo.event.Event;
import com.example.demo.user.User;

@Order(5)
@Component
public class OutOfContextQuestionHandler extends AbstractQuestionHandler {

    public OutOfContextQuestionHandler(RelevantEventService relevantEventService,
                                        ConversationManager conversationManager,
                                        GroqAi groqClient,
                                        ConversationHistoryService historyService,
                                        DateParserService dateParserService) {
        super(relevantEventService, conversationManager, groqClient, historyService, dateParserService);
    }

    @Override
    public boolean canHandle(String text) {
        return true; // Manejează orice întrebare care nu se potrivește altor tipuri
    }

    @Override
    protected String getContext() {
        return "general";
    }

    @Override
    protected List<Event> getRelevantEvents(User user, String text, DateRange range) {
        return null; // Nu sunt necesare evenimente pentru întrebările generale
    }
}
