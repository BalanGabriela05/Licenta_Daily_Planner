package com.example.demo.event;


import java.time.LocalDateTime;

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
public class EventResponse {
        private Integer id;
        private String title;
        private String description;
        private String dateEvent;
        private boolean ownerEvent;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private PriorityLevel priority;
        private RecurrenceType recurrenceType;
}
