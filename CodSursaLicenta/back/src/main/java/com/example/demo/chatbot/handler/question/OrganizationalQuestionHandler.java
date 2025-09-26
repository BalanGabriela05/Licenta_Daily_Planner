package com.example.demo.chatbot.handler.question;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.example.demo.chatbot.ConversationManager;
import com.example.demo.chatbot.GroqAi;
import com.example.demo.chatbot.date.DateParserService;
import com.example.demo.chatbot.handler.AbstractQuestionHandler;
import com.example.demo.chatbot.handler.RelevantEventService;
import com.example.demo.chatbot.history.ConversationHistoryService;

@Order(1)
@Component
public class OrganizationalQuestionHandler extends AbstractQuestionHandler {

    public OrganizationalQuestionHandler(RelevantEventService relevantEventService,
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
            "(?=.*\\b(?:event(s)?|schedule(s)?|meeting(s)?|appointment(s)?|to do|free time|available slot(s)?)\\b)" +
            "(?=.*\\b(?:today|tomorrow|yesterday|this week|next week|this month|next month)\\b)?" +
            ".*"
        );
    }

    @Override
    protected String getContext() {
        return "organizational";
    }
}