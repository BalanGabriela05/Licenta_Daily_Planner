package com.example.demo.chatbot.history;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.chatbot.ConversationMessage;
import com.example.demo.chatbot.ConversationMessageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ConversationHistoryService {

    private final ConversationMessageRepository repository;
    private final ConversationHistoryRepository historyRepository;

    public void saveUserMessage(Integer userId, String message) {
        ConversationMessage msg = new ConversationMessage(null, userId, "User", message, LocalDateTime.now());
        repository.save(msg);
    }

    public void saveAIResponse(Integer userId, String message) {
        ConversationMessage msg = new ConversationMessage(null, userId, "AI", message, LocalDateTime.now());
        repository.save(msg);
    }

    public List<ConversationMessage> getHistory(Integer userId) {
        return repository.findByUserIdOrderByTimestampAsc(userId);
    }

    public void deleteHistoryForUser(Integer userId) {
        historyRepository.deleteByUserId(userId);
    }
}
