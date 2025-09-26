package com.example.demo.calendar;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.user.User;


public interface CalendarRepository extends JpaRepository<Calendar, Integer>, JpaSpecificationExecutor<Calendar> {
  
  Optional<Calendar> findByNameCalendar(String nameCalendar);
  
  @Query("SELECT c FROM Calendar c WHERE LOWER(c.nameCalendar) = LOWER(:nameCalendar) AND c.owner = :owner")
  Optional<Calendar> findByNameCalendarIgnoreCaseAndOwner(@Param("nameCalendar") String nameCalendar, @Param("owner") User owner);
}