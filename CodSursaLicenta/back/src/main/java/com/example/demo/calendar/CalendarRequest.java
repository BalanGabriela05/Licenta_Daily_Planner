package com.example.demo.calendar;

import jakarta.validation.constraints.NotEmpty;

public record CalendarRequest(

  Integer id, 
  @NotEmpty(message = "Calendar name should not be empty")
  String nameCalendar,
  @NotEmpty(message = "Color should not be empty")
  String color
  
) {
} 