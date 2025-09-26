package com.example.demo.calendar;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.calendar.share.ShareCalendRepository;
import com.example.demo.event.EventRepository;
import com.example.demo.user.User;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final CalendarRepository calendarRepository;
    private final CalendarMapper calendarMapper;
    private final EventRepository eventRepository;
    private final ShareCalendRepository shareCalendRepository;

    public Integer saveCalendar(CalendarRequest request, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        Calendar calendar = calendarMapper.toCalendar(request);
        calendar.setOwner(user); // Set the calendar as primary if needed, based on your logic
        return calendarRepository.save(calendar).getId();
    }


    public CalendarResponse findCalendarById(Integer calendarId){
        return calendarRepository.findById(calendarId)
                .map(calendarMapper::toCalendarResponse)
                .orElseThrow(() -> new EntityNotFoundException("No calendar found with id " + calendarId));
    }

    public List<CalendarResponse> findAllCalendars(Authentication connectedUser){ 
        User user = (User) connectedUser.getPrincipal();
        return calendarRepository.findAll(CalendarSpecification.withOwnerId(user.getId()))
                .stream()
                .map(calendarMapper::toCalendarResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteCalendar(Integer calendarId, Authentication authentication) {
    User user = (User) authentication.getPrincipal();
    Calendar calendar = calendarRepository.findById(calendarId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Calendar not found"));
System.out.println("Calendar found: " + calendar.getNameCalendar());
    if (!calendar.getOwner().equals(user)) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this calendar");
    }

    if (calendar.getNameCalendar().equals(user.getFirstname() + "'s calendar")) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot delete your default calendar.");
    }

    // Șterge toate evenimentele asociate calendarului
    shareCalendRepository.deleteByCalendarId(calendarId);

    eventRepository.deleteByCalendar(calendar);

    calendarRepository.delete(calendar);
}
    @Transactional
    public void updateCalendar(Integer calendarId, CalendarRequest request, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Calendar calendar = calendarRepository.findById(calendarId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Calendar not found"));

        if (!calendar.getOwner().equals(user)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this calendar");
        }

        // Nu permite editarea calendarului principal
        if (calendar.getNameCalendar().equals(user.getFirstname() + "'s calendar")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot edit your default calendar.");
        }

        calendar.setNameCalendar(request.nameCalendar());
        calendar.setColor(request.color());

        calendarRepository.save(calendar);
    }
}
