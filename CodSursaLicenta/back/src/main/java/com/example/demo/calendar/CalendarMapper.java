package com.example.demo.calendar;

import org.springframework.stereotype.Service;

import lombok.Builder;

@Service
@Builder
public class CalendarMapper {
  
  public Calendar toCalendar(CalendarRequest request) {
    return Calendar.builder()
      .id(request.id())
      .nameCalendar(request.nameCalendar())
      .color(request.color())
      .isPrimary(false) // Default to false, can be set to true based on your logic
      .build();
  }

  public CalendarResponse toCalendarResponse(Calendar calendar) {
    return CalendarResponse.builder()
      .id(calendar.getId())
      .nameCalendar(calendar.getNameCalendar())
      .owner(calendar.getOwner().fullName())
      .color(calendar.getColor())
      .isPrimary(calendar.isPrimary())
      .build();
  }
}
