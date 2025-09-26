package com.example.demo.chatbot.history;

import java.util.List;

import com.example.demo.chatbot.ConversationMessage;

public class ConversationHistoryFormatter {
    public static String formatHistory(List<ConversationMessage> history) {
        StringBuilder sb = new StringBuilder();
        if (history == null || history.isEmpty()) {
            sb.append("- No previous conversation history available.\n");
        } else {
            for (ConversationMessage msg : history) {
                sb.append(msg.getSender()).append(": ").append(msg.getMessage()).append("\n");
            }
        }
        return sb.toString();
    }
}