package com.example.demo.aichat;


import org.springframework.stereotype.Service;

import com.example.demo.aichat.command.Command;
import com.example.demo.aichat.command.CommandFactory;
import com.example.demo.event.EventRequest;
import com.example.demo.user.User;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class ChatAiService {
    
    private final GroqClient groqClient;
    private final CommandFactory commandFactory;
    private final IntentDetectorService intentDetectorService;
    private final PromptBuilderService promptBuilderService;
    
    public String processEventPrompt(String prompt, User user) {
        // 1. Detectarea intenției
        String detectedAction = intentDetectorService.detectAction(prompt);
        if ("unknown".equals(detectedAction)) {
            return "Error: Unable to determine action from the provided prompt.";
        }
        
        // 2. Construirea promptului specific
        String finalPrompt = promptBuilderService.buildPrompt(detectedAction, prompt);
        
        // 3. Apelul API către AI
        String aiResponseJson = groqClient.sendPrompt(finalPrompt);
        System.out.println("AI raw response: " + aiResponseJson);
        
        // 4. Parsarea răspunsului
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        AiCommandResponse aiResponse;
        try {
            JsonNode root = mapper.readTree(aiResponseJson);
            String rawJson = root.path("choices").get(0).path("message").path("content").asText();
            aiResponse = mapper.readValue(rawJson, AiCommandResponse.class);
        } catch (Exception e) {
            return "Eroare la interpretarea răspunsului AI: " + e.getMessage();
        }
        
        // 5. Tratarea cazurilor de eroare din răspunsul AI
        if (aiResponse.getError() != null && !aiResponse.getError().isEmpty()) {
            return "Eroare: " + aiResponse.getError();
        }
        
        // 6. Obținerea comenzii și execuția acesteia
        Command command;
        try {
            switch (aiResponse.getAction()) {
                case "create_event":
                    EventRequest eventRequest = mapper.convertValue(aiResponse.getData(), EventRequest.class);
                    command = commandFactory.getCommand("create_event", eventRequest, user);
                    break;
                // alte cazuri: create_calendar, delete_event, etc.
                default:
                    return "Error: Unknown action: " + aiResponse.getAction();
            }
        } catch (Exception e) {
            return "Error converting AI data to DTO: " + e.getMessage();
        }
        
        return command.execute();
    }
}
// @Service
// @RequiredArgsConstructor
// public class ChatAiService {
    
//     private final GroqClient groqClient;
//     private final CommandFactory commandFactory;
//     private final IntentDetectorService intentDetectorService;
//     private final PromptBuilderService promptBuilderService;
//     private final SchedulingAdvisorService schedulingAdvisorService;
//     private final ConversationService conversationService;  // nou: serviciul de conversation state machine
    
//     public String processEventPrompt(String prompt, User user) {
//         // 1. Detectarea intenției
//         String detectedAction = intentDetectorService.detectAction(prompt);
//         if ("unknown".equals(detectedAction)) {
//             return "Error: Unable to determine action from the provided prompt.";
//         }
        
//         // Dacă cererea este de tip "schedule_advice", inițiază dialogul interactiv
//         if ("schedule_advice".equals(detectedAction)) {
//             // 1. Setează starea inițială și trimite evenimentul de SUBMIT_QUERY
//             conversationService.sendEvent(EventState.SUBMIT_QUERY);
            
//             // Salvează detalii inițiale despre cerere, de exemplu textul complet
//             conversationService.setExtendedStateValue("initialQuery", prompt);
            
//             // Aici poți întreba utilizatorul suplimentar (ex. preferința pentru intervalul zilei)
//             // Dacă avem un răspuns, se va trimite evenimentul PROVIDE_PREFERENCE
//             // Pentru exemplificare, presupunem că preferința este "dimineața".
//             conversationService.setExtendedStateValue("preferredTime", "dimineața");
//             conversationService.sendEvent(EventState.PROVIDE_PREFERENCE);
            
//             // În starea ANALYSIS, se efectuează analiza datelor din calendar
//             // Aici poți apela SchedulingAdvisorService pentru a obține recomandările
//             conversationService.sendEvent(EventState.ANALYZE);
//             SchedulingRecommendationRequest recommendationRequest =
//                 new SchedulingRecommendationRequest(prompt, (String) conversationService.getExtendedStateValue("preferredTime"));
//             SchedulingRecommendationResponse recommendationResponse =
//                 schedulingAdvisorService.analyzeAndRecommend(user, recommendationRequest);
            
//             // După obținerea recomandării, treci la starea RECOMMENDATION
//             conversationService.sendEvent(EventState.GIVE_RECOMMENDATION);
            
//             // Returnează mesajul de recomandare finală
//             return recommendationResponse.recommendationMessage();
//         }
        
//         // Pentru alte acțiuni (ex. create_event), folosește fluxul existent
//         String finalPrompt = promptBuilderService.buildPrompt(detectedAction, prompt);
//         String aiResponseJson = groqClient.sendPrompt(finalPrompt);
//         System.out.println("AI raw response: " + aiResponseJson);
//         ObjectMapper mapper = new ObjectMapper();
//         mapper.registerModule(new JavaTimeModule());
//         AiCommandResponse aiResponse;
//         try {
//             JsonNode root = mapper.readTree(aiResponseJson);
//             String rawJson = root.path("choices").get(0).path("message").path("content").asText();
//             aiResponse = mapper.readValue(rawJson, AiCommandResponse.class);
//         } catch (Exception e) {
//             return "Error parsing AI response: " + e.getMessage();
//         }
//         if (aiResponse.getError() != null && !aiResponse.getError().isEmpty()) {
//             return "Error: " + aiResponse.getError();
//         }
//         Command command;
//         try {
//             switch (aiResponse.getAction()) {
//                 case "create_event":
//                     EventRequest eventRequest = mapper.convertValue(aiResponse.getData(), EventRequest.class);
//                     command = commandFactory.getCommand("create_event", eventRequest, user);
//                     break;
//                 default:
//                     return "Error: Unknown action: " + aiResponse.getAction();
//             }
//         } catch (Exception e) {
//             return "Error converting AI data to DTO: " + e.getMessage();
//         }
//         return command.execute();
//     }
// }
