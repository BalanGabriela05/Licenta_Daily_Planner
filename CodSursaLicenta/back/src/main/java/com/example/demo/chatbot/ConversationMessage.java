package com.example.demo.chatbot;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "conversation_messages")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConversationMessage {

    @Id
    @GeneratedValue
    private Long id;

    private Integer userId;
    private String sender; // "User" or "AI"
    @Column(length = 2000)
    private String message;

    private LocalDateTime timestamp;
}
