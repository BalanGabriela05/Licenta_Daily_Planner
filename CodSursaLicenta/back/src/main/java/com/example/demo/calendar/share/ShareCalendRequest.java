package com.example.demo.calendar.share;

import jakarta.validation.constraints.NotNull;

public record ShareCalendRequest(

    @NotNull(message = "Calendar ID is required")
    Integer calendarId,
    @NotNull(message = "Friend ID is required")
    Integer friendId,
    @NotNull(message = "Permission is required")
    CalendarPermission permission
) {
} 