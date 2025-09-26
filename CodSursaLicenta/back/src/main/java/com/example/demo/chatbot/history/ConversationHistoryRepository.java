package com.example.demo.chatbot.history;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.chatbot.ConversationMessage;

import jakarta.transaction.Transactional;

public interface ConversationHistoryRepository extends JpaRepository<ConversationMessage, Long> {
  @Transactional
  void deleteByUserId(Integer userId);
  
  List<ConversationMessage> findByUserIdOrderByTimestampAsc(Integer userId);
}
