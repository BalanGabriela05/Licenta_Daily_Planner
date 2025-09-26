package com.example.demo.event;

import java.time.LocalDateTime;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;


public record EventRequest(
        @NotEmpty(message = "Title should not be empty")
        String title,

        // @Size(min = 1, max = 255, message = "Description should be between 1 and 255 characters")
        String description,

        @NotNull(message = "Start time should not be empty")
        LocalDateTime startTime,

        @NotNull(message = "End time should not be empty")
        LocalDateTime endTime,

        @NotNull(message = "Calendar id should not be null")
        Integer calendarId,

        // @NotEmpty(message = "Calendar id should not be null")
        // String calendarName,

        Integer userId,

        @NotNull(message = "Priority should not be null")
        PriorityLevel priority, // LOW, MEDIUM, HIGH

        @NotNull(message = "Recurrence type should not be null")
        RecurrenceType recurrenceType // NONE, DAILY, WEEKLY, MONTHLY, YEARLY
) {

}
