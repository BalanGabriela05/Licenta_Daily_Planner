package com.example.demo.chatbot.date;


import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class DateParserService {

    public DateRange parseDateRange(String message) {
        LocalDate today = LocalDate.now();
    
        // Case 1: "today"
        if (message.matches("(?i).*\\btoday\\b.*")) {
            return new DateRange(today.atStartOfDay(), today.plusDays(1).atStartOfDay());
        }
    
        // Case 2: "tomorrow"
        if (message.matches("(?i).*\\btomorrow\\b.*")) {
            return new DateRange(today.plusDays(1).atStartOfDay(), today.plusDays(2).atStartOfDay());
        }
    
        // Case 3: "this week" (from today to Sunday)
        if (message.matches("(?i).*\\bthis week\\b.*")) {
            LocalDate endOfWeek = today.with(DayOfWeek.SUNDAY);
            return new DateRange(today.atStartOfDay(), endOfWeek.plusDays(1).atStartOfDay());
        }
    
        // Case 4: "next week" (from next Monday to next Sunday)
        if (message.matches("(?i).*\\bnext week\\b.*")) {
            LocalDate nextMonday = today.with(DayOfWeek.MONDAY).plusWeeks(1);
            LocalDate nextSunday = nextMonday.plusDays(6);
            return new DateRange(nextMonday.atStartOfDay(), nextSunday.plusDays(1).atStartOfDay());
        }
    
        // Case 5: "this month" (from the 1st of this month to the 1st of next month)
        if (message.matches("(?i).*\\bthis month\\b.*")) {
            LocalDate firstOfMonth = today.withDayOfMonth(1);
            LocalDate firstOfNextMonth = firstOfMonth.plusMonths(1);
            return new DateRange(firstOfMonth.atStartOfDay(), firstOfNextMonth.atStartOfDay());
        }
    
        // Case 6: "next month" (from the 1st of next month to the 1st of the following month)
        if (message.matches("(?i).*\\bnext month\\b.*")) {
            LocalDate firstOfNextMonth = today.withDayOfMonth(1).plusMonths(1);
            LocalDate firstOfFollowingMonth = firstOfNextMonth.plusMonths(1);
            return new DateRange(firstOfNextMonth.atStartOfDay(), firstOfFollowingMonth.atStartOfDay());
        }
    
        // Case 7: "in the next X days"
        Matcher matcher = Pattern.compile("(?i)in the next (\\d+) days").matcher(message);
        if (matcher.find()) {
            int days = Integer.parseInt(matcher.group(1));
            return new DateRange(today.atStartOfDay(), today.plusDays(days).atStartOfDay());
        }
    
        // Default case: "this week" (from today to Sunday)
        LocalDate endOfWeek = today.with(DayOfWeek.SUNDAY);
        return new DateRange(today.atStartOfDay(), endOfWeek.plusDays(1).atStartOfDay());
    }
}