package com.example.demo.event;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;


import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/events")
@Tag(name = "Event")

public class EventController {

    private final EventService eventService;

    @PostMapping
    public ResponseEntity<Integer> saveEvent(
            @Valid @RequestBody EventRequest request,Authentication connectedUser
    ) {
        return ResponseEntity.ok(eventService.saveEvent(request, connectedUser));
    }

    @GetMapping("/calendar/{calendar-id}")
    public ResponseEntity<List<EventResponse>> findEventsByCalendar(
            @PathVariable("calendar-id") Integer calendarId,
            Authentication connectedUser
    ) {
        return ResponseEntity.ok(eventService.findEventsByCalendar(calendarId, connectedUser));
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<String> deleteEvent(
            @PathVariable Integer eventId,
            Authentication connectedUser
    ) {
        eventService.deleteEvent(eventId, connectedUser);
        return ResponseEntity.ok("Event deleted successfully.");
    }

    @PutMapping("/{eventId}")
    public ResponseEntity<String> updateEvent(
            @PathVariable Integer eventId,
            @Valid @RequestBody EventRequest request,
            Authentication connectedUser
    ) {
        eventService.updateEvent(eventId, request, connectedUser);
        return ResponseEntity.ok("Event updated successfully.");
    }



}
