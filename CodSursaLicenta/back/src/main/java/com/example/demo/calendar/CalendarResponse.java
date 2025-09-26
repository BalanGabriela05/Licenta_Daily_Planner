package com.example.demo.calendar;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CalendarResponse {

  private Integer id;
  private String nameCalendar;
  private String owner;
  private String color;
  private boolean isPrimary;
} 