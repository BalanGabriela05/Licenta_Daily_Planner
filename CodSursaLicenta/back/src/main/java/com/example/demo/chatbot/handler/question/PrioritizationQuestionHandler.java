package com.example.demo.chatbot.handler.question;

import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.example.demo.chatbot.ConversationManager;
import com.example.demo.chatbot.GroqAi;
import com.example.demo.chatbot.date.DateParserService;
import com.example.demo.chatbot.handler.AbstractQuestionHandler;
import com.example.demo.chatbot.handler.RelevantEventService;
import com.example.demo.chatbot.history.ConversationHistoryService;

@Order(2)
@Component
public class PrioritizationQuestionHandler extends AbstractQuestionHandler {

    public PrioritizationQuestionHandler(RelevantEventService relevantEventService,
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
            "(?=.*\\b(?:event(s)?|task(s)?|meeting(s)?|deadline(s)?)\\b)" +
            "(?=.*\\b(?:important|urgent|critical|high-?priority|prioritize|priority|medium-?priority|low-?priority)\\b)" +
            "(?=.*\\b(?:today|tomorrow|yesterday|this week|next week|this month|next month)\\b)?" +
            ".*"
        );
    }

    @Override
    protected String getContext() {
        return "prioritization";
    }
}