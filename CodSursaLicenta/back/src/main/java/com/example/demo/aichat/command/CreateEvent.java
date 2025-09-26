package com.example.demo.aichat.command;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import com.example.demo.event.EventRequest;
import com.example.demo.event.EventService;
import com.example.demo.user.User;

import lombok.RequiredArgsConstructor;


@RequiredArgsConstructor
public class CreateEvent implements Command {

    private final EventService eventService;
    private final EventRequest eventRequest;
    private final User user;

    @Override
    public String execute() {
        Integer eventId = eventService.saveEvent(eventRequest, 
            new UsernamePasswordAuthenticationToken(user, null));
        return "Event created successfully with ID: " + eventId;
    }
}
