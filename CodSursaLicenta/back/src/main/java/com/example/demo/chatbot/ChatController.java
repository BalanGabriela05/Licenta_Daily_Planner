package com.example.demo.chatbot;


import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.chatbot.history.ConversationHistoryService;
import com.example.demo.user.User;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/chatbot")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final ConversationHistoryService historyService;


    @PostMapping
    public ResponseEntity<String> chat(@Valid @RequestBody ChatRequest request, Authentication authentication) {
        System.out.println("ChatController: " + request.message());
        String response = chatService.handleMessage(authentication, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/history")
    public ResponseEntity<Void> clearChatHistory(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        historyService.deleteHistoryForUser(user.getId());
        return ResponseEntity.noContent().build();
    }
}
