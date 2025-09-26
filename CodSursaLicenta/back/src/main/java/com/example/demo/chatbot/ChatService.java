package com.example.demo.chatbot;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import com.example.demo.chatbot.handler.QuestionHandler;
import com.example.demo.chatbot.history.ConversationHistoryService;
import com.example.demo.user.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final List<QuestionHandler> handlers;
    private final ConversationHistoryService historyService;

    public String handleMessage(Authentication authentication, ChatRequest request) {
        try {
            User user = (User) authentication.getPrincipal();
            String text = request.message();
            historyService.saveUserMessage(user.getId(), text);

            for (QuestionHandler handler : handlers) {
                if (handler.canHandle(text)) {
                    return handler.handle(user, text);
                }
            }

            return "I'm sorry, I couldn't understand your request.";
        } catch (Exception e) {
            return "An error occurred while processing your request: " + e.getMessage();
        }
    }


    
}

