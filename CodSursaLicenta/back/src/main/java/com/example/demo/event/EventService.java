package com.example.demo.event;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.calendar.Calendar;
import com.example.demo.calendar.CalendarRepository;
import com.example.demo.calendar.share.CalendarPermission;
import com.example.demo.calendar.share.ShareCalendRepository;
import com.example.demo.user.User;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;


@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository eventRepository;
    private final EventMapper eventMapper;
    private final CalendarRepository calendarRepository;
    private final ShareCalendRepository shareCalendRepository;
    
    @PersistenceContext
    private final EntityManager entityManager;

    public Integer saveEvent(EventRequest request, Authentication connectedUser) {
        
        // Obține utilizatorul conectat
        User user = (User) connectedUser.getPrincipal();
         // verify if the calendar exists
        Calendar calendar = calendarRepository.findById(request.calendarId())
            .orElseThrow(() -> new RuntimeException("No calendar found with id " + request.calendarId()));
        // if (!calendar.getOwner().getId().equals(user.getId())) {
        //     throw new RuntimeException("You do not own this calendar");
        // }
        // Calendar calendar = calendarRepository.findByNameCalendarIgnoreCaseAndOwner(request.calendarName(), user)  
        // .orElseThrow(() -> new RuntimeException("No calendar found with name " + request.calendarName()));

        // Verifică dacă utilizatorul este proprietarul sau are permisiunea EDIT
        boolean isOwner = calendar.getOwner().getId().equals(user.getId());
        boolean hasEditPermission = shareCalendRepository.existsByCalendarAndSharedWithAndPermission(
                calendar, user, CalendarPermission.EDIT);

        if (!isOwner && !hasEditPermission) {
            throw new RuntimeException("You do not have permission to add events to this calendar");
        }


        //  startTime < endTime
        if (request.startTime().isAfter(request.endTime())) {
            throw new RuntimeException("Start time must be before end time!");
        }

        // verify if the start time is in the past
        // if (request.startTime().isBefore(LocalDateTime.now())) {
        //     throw new RuntimeException("You cannot create an event in the past!");
        // }

        // verify if there is already an event scheduled at this time
        if (eventRepository.existsOverlappingEvent(calendar.getId(), request.startTime(), request.endTime())) {
            throw new RuntimeException("There is already an event scheduled at this time!");
        }
        


        // save the event
        Event event = eventMapper.toEvent(request);
        event.setCalendar(calendar);
        event.setCreatedBy(calendar.getOwner()); 
        return eventRepository.save(event).getId();
        
    }

    public List<EventResponse> findEventsByCalendar(Integer calendarId, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();

        Calendar calendar = calendarRepository.findById(calendarId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Calendar not found"));

        if (!calendar.getOwner().getId().equals(user.getId())) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this calendar");
        }
        List<Event> events = eventRepository.findByCalendarId(calendarId);
        List<EventResponse> eventResponses = events.stream()
                .map(e -> eventMapper.toEventResponse(e, user.getId())).toList();
        return eventResponses;
    }

    public void deleteEvent(Integer eventId, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        // if (!event.getCalendar().getOwner().equals(user)) {
        //     throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this event");
        // }
        if (!event.getCalendar().getOwner().getId().equals(user.getId())) {
            // Dacă nu e owner, verifică dacă are permisiune de edit
            boolean hasEditPermission = shareCalendRepository.existsByCalendarAndSharedWithAndPermission(
                event.getCalendar(), user, CalendarPermission.EDIT);
            if (!hasEditPermission) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to edit this event");
            }
        }

        eventRepository.delete(event);
    }

    public void updateEvent(Integer eventId, EventRequest request, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
    
        // if (!event.getCalendar().getOwner().equals(user)) {
        //     throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this event");
        // }
        if (!event.getCalendar().getOwner().getId().equals(user.getId())) {
            // Dacă nu e owner, verifică dacă are permisiune de edit
            boolean hasEditPermission = shareCalendRepository.existsByCalendarAndSharedWithAndPermission(
                event.getCalendar(), user, CalendarPermission.EDIT);
            if (!hasEditPermission) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to edit this event");
            }
        }
    
        event.setTitle(request.title());
        event.setStartTime(request.startTime());
        event.setEndTime(request.endTime());
        event.setDescription(request.description());
        event.setPriority(request.priority());
        event.setRecurrenceType(request.recurrenceType());
    
        eventRepository.save(event);
    }

    public List<Event> getUserEventsInRange(Integer userId,
                                            LocalDateTime from,
                                            LocalDateTime to) {
        return eventRepository.findByCreatedByIdAndStartTimeBetween(userId, from, to);
    }


    public List<Event> getUserPriorityEvents(Integer userId, PriorityLevel priority) {
        return eventRepository.findByCreatedByIdAndPriority(userId, priority);
    }

    @SuppressWarnings("unchecked")
    public List<Event> searchEventsByTitle(Integer userId, String searchQuery) {
        String sql = """
            SELECT e.*
            FROM events e
            JOIN calendars c ON e.calendar_id = c.id
            WHERE (
                c.owner_id = :userId
                OR EXISTS (
                    SELECT 1 FROM share_calendar sc
                    WHERE sc.calendar_id = c.id AND sc.shared_with_id = :userId
                )
            )
            AND to_tsvector('english', e.title) @@ websearch_to_tsquery('english', :searchQuery)
            ORDER BY ts_rank(to_tsvector('english', e.title), websearch_to_tsquery('english', :searchQuery)) DESC
        """;

        return entityManager.createNativeQuery(sql, Event.class)
                            .setParameter("userId", userId)
                            .setParameter("searchQuery", searchQuery)
                            .getResultList();
    }
        
    // public List<Event> getUserEventsForThisWeek(Integer userId) {
    //     // Luni dimineață (începutul săptămânii)
    //     LocalDate today = LocalDate.now();
    //     LocalDate monday = today.with(DayOfWeek.MONDAY);
    //     LocalDate sunday = today.with(DayOfWeek.SUNDAY);

    //     LocalDateTime startOfWeek = monday.atStartOfDay();
    //     LocalDateTime endOfWeek = sunday.atTime(LocalTime.MAX);

    //     return eventRepository.findByCreatedByIdAndStartTimeBetween(userId, startOfWeek, endOfWeek);
    // }
    
//


}
