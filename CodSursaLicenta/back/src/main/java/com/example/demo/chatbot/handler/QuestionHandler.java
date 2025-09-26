package com.example.demo.chatbot.handler;

import com.example.demo.user.User;

public interface QuestionHandler {
    boolean canHandle(String text);
    String handle(User user, String text);
}