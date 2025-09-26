package com.example.demo.chatbot.date;

import java.time.LocalDateTime;
import java.time.LocalTime;


public record DateRange(LocalDateTime from, LocalDateTime to) {
  
      public static DateRange getDefaultDateRange() {
        LocalDateTime now = LocalDateTime.now();
        return new DateRange(
            now,
            now.withDayOfMonth(now.toLocalDate().lengthOfMonth()).with(LocalTime.MAX)
        );
    }
}
