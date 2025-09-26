package com.example.demo.event;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.calendar.Calendar;

public interface EventRepository extends JpaRepository<Event, Integer> {

    Optional<Event> findByTitle(String title);
    List<Event> findByCalendar(Calendar calendar);

    @Query("""
        SELECT event
        FROM Event event
        WHERE event.calendar.id = :calendarId
        """)
    List<Event> findByCalendarId(Integer calendarId);

    @Query("""
        SELECT COUNT(e) > 0 FROM Event e
        WHERE e.calendar.id = :calendarId
        AND (
            (e.startTime BETWEEN :startTime AND :endTime) OR
            (e.endTime BETWEEN :startTime AND :endTime) OR
            (e.startTime <= :startTime AND e.endTime >= :endTime)
        )
    """)
    boolean existsOverlappingEvent(@Param("calendarId") Integer calendarId, 
                                    @Param("startTime") LocalDateTime startTime, 
                                    @Param("endTime") LocalDateTime endTime);

    void deleteByCalendar(Calendar calendar);

    List<Event> findByCreatedByIdAndStartTimeBetween(
    Integer createdById,
    LocalDateTime start,
    LocalDateTime end
    );

    List<Event> findByCreatedByIdAndPriority(Integer createdById, PriorityLevel priority);
    List<Event> findByRecurrenceType(RecurrenceType recurrenceType);
}
