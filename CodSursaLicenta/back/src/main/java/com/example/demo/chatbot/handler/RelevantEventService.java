package com.example.demo.chatbot.handler;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.calendar.share.ShareCalendService;
import com.example.demo.event.Event;
import com.example.demo.event.EventService;
import com.example.demo.user.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RelevantEventService {

    private final EventService eventService;
    private final ShareCalendService shareCalendService;

    /**
     * Retrieves all relevant events for a user, including personal and shared events.
     *
     * @param user The user for whom to retrieve events.
     * @param from The start date of the interval.
     * @param to The end date of the interval.
     * @return The list of relevant events.
     */
    public List<Event> getAllRelevantEvents(User user, LocalDateTime from, LocalDateTime to) {

        List<Event> userEvents = eventService.getUserEventsInRange(user.getId(), from, to);

        List<Event> sharedEvents = shareCalendService.getEventsFromSharedCalendars(user, from, to);

        List<Event> allEvents = new ArrayList<>(userEvents);
        allEvents.addAll(sharedEvents);

        return allEvents;
    }
    /**
     * Searches for relevant events based on a text in the title.
     *
     * @param text The text used for searching.
     * @return The list of events matching the text.
     */
    public List<Event> searchEventsByTitle(Integer userId, String text) {
        return eventService.searchEventsByTitle(userId, text);
    }
}