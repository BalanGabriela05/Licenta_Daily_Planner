package com.example.demo.calendar.share;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ShareCalendResponse {
  
  private Integer calendarId;
  private String calendarName;
  private String sharedWith;
  private CalendarPermission permission;
  private String color;
  private String ownerName;
}
