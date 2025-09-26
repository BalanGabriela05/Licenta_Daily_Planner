package com.example.demo.aichat.command;

import org.springframework.stereotype.Service;

import com.example.demo.event.EventRequest;
import com.example.demo.event.EventService;
import com.example.demo.user.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommandFactory {

    private final EventService eventService;
    
    // Poți injecta și alte servicii (ex. CalendarService, FriendService) după nevoie
    
    public Command getCommand(String action, EventRequest eventRequest, User user) {
        switch (action) {
            case "create_event":
                return new CreateEvent(eventService, eventRequest, user);
            // case "create_calendar":
            //     return new CreateCalendarCommand(...);

            default:
                throw new IllegalArgumentException("Unknown action: " + action);
        }
    }
}
