package com.example.demo.event;
import org.springframework.stereotype.Service;

import com.example.demo.calendar.Calendar;
import com.example.demo.user.User;

import lombok.Builder;


@Service
@Builder
public class EventMapper {
    
    public Event toEvent(EventRequest request) {
        return Event.builder()
                .title(request.title())
                .description(request.description())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .calendar(Calendar.builder()
                            .id(request.calendarId())
                            .build())
                .createdBy(User.builder()
                            .id(request.userId())
                            .build())
                .priority(request.priority())
                .recurrenceType(request.recurrenceType())
                .build();
    }

    public EventResponse toEventResponse(Event event, Integer userId) {
    return EventResponse.builder()
            .id(event.getId())
            .title(event.getTitle())
            .description(event.getDescription())
            .startTime(event.getStartTime())
            .endTime(event.getEndTime())
            .ownerEvent(event.getCreatedBy() != null && 
                        event.getCreatedBy().getId() != null &&
                        event.getCreatedBy().getId().equals(userId))
            .priority(event.getPriority())
            .recurrenceType(event.getRecurrenceType())
            .build();
    }
}
