package com.example.demo.aichat;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.user.User;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/chat-ai")
@RequiredArgsConstructor
public class ChatAiController {

    private final ChatAiService aiService;

    @PostMapping
    public ResponseEntity<String> handleAiEvent(@RequestBody ChatRequestAi chatRequest, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        String result = aiService.processEventPrompt(chatRequest.prompt(), user);
        return ResponseEntity.ok(result);
    }
}

