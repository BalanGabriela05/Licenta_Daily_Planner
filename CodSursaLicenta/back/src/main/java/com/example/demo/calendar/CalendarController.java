package com.example.demo.calendar;

import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("calendars")
@RequiredArgsConstructor
@Tag(name = "Calendar")
public class CalendarController {

private final CalendarService calendarService;

    @PostMapping
    public ResponseEntity<Integer> saveCalendar(
            @Valid @RequestBody CalendarRequest request, Authentication connectedUser
    ) {
        return ResponseEntity.ok(calendarService.saveCalendar(request, connectedUser));
    }

    @GetMapping("/{calendar-id}")
    public ResponseEntity<CalendarResponse> findCalendarById(
            @RequestParam("calendar-id") Integer calendarId
    ) {
        return ResponseEntity.ok(calendarService.findCalendarById(calendarId));
    }

    @GetMapping("/owner")
    public  ResponseEntity<List<CalendarResponse>> findAllCalendars(Authentication connectedUser) {
        return ResponseEntity.ok(calendarService.findAllCalendars(connectedUser));
    }
    
    @DeleteMapping("/{calendarId}")
    public ResponseEntity<String> deleteCalendar(
            @PathVariable Integer calendarId,
            Authentication connectedUser
    ) {
        calendarService.deleteCalendar(calendarId, connectedUser);
        return ResponseEntity.ok("Calendar deleted successfully.");
    }


    @PutMapping("/{calendarId}")
    public ResponseEntity<String> updateCalendar(
            @PathVariable Integer calendarId,
            @Valid @RequestBody CalendarRequest request,
            Authentication connectedUser
    ) {
        calendarService.updateCalendar(calendarId, request, connectedUser);
        return ResponseEntity.ok("Calendar updated successfully.");
    }
}