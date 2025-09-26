package com.example.demo.chatbot.util;

import com.example.demo.event.Event;
import java.util.List;

public class EventFormatter {
    public static String formatEvents(List<Event> events) {
        if (events == null || events.isEmpty()) {
            return "- No events scheduled during this time.\n";
        }
        StringBuilder sb = new StringBuilder();
        for (Event e : events) {
            sb.append("- Title: ").append(e.getTitle())
              .append(" | Start: ").append(e.getStartTime())
              .append(" | End: ").append(e.getEndTime()).append("\n");
        }
        return sb.toString();
    }

    public static String formatEventsWithPriority(List<Event> events) {
        if (events == null || events.isEmpty()) {
            return "- No prioritized events found.\n";
        }
        StringBuilder sb = new StringBuilder();
        for (Event e : events) {
            sb.append("- Title: ").append(e.getTitle())
              .append(" | Priority: ").append(e.getPriority())
              .append(" | Start: ").append(e.getStartTime())
              .append(" | End: ").append(e.getEndTime()).append("\n");
        }
        return sb.toString();
    }
}