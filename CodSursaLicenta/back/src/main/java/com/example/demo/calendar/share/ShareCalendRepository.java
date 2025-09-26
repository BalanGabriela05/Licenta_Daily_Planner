package com.example.demo.calendar.share;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.calendar.Calendar;
import com.example.demo.event.Event;
import com.example.demo.user.User;

public interface ShareCalendRepository extends JpaRepository<ShareCalend, Integer> {

  List<ShareCalend> findBySharedWith(User user);
  Optional<ShareCalend> findByCalendarAndSharedWith(Calendar calendar, User user);

    @Query("SELECT CASE WHEN COUNT(sc) > 0 THEN true ELSE false END " +
        "FROM ShareCalend sc " +
        "WHERE sc.calendar = :calendar AND sc.sharedWith = :sharedWith AND sc.permission = :permission")
  boolean existsByCalendarAndSharedWithAndPermission(@Param("calendar") Calendar calendar,
                                                    @Param("sharedWith") User sharedWith,
                                                    @Param("permission") CalendarPermission permission);

  @Query("SELECT CASE WHEN COUNT(sc) > 0 THEN true ELSE false END FROM ShareCalend sc WHERE sc.calendar.id = :calendarId AND sc.sharedWith = :sharedWith")
  boolean existsSharedAccess(@Param("calendarId") Integer calendarId, @Param("sharedWith") User sharedWith);

  // In EventRepository
  @Query("SELECT e FROM Event e WHERE e.calendar.id = :calendarId")
  List<Event> findByCalendarId(@Param("calendarId") Integer calendarId);

  List<ShareCalend> findByCalendar(Calendar calendar);

  void deleteByCalendarId(Integer calendarId);
} 
