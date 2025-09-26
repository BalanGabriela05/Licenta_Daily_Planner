package com.example.demo.calendar.share;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.event.Event;
import com.example.demo.event.EventMapper;
import com.example.demo.event.EventResponse;
import com.example.demo.user.User;

import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;


@RestController
@RequestMapping("/calendar-share")
@RequiredArgsConstructor
public class ShareCalendController {
  
  private final ShareCalendService shareCalendService;
  private final EventMapper eventMapper;

  @PostMapping
  public ResponseEntity<String> shareCalendar(
      @RequestBody ShareCalendRequest request,
      Authentication connectedUser) {
    shareCalendService.shareCalendar(request, connectedUser);
    return ResponseEntity.ok("Calendar shared successfully.");
  }

  @GetMapping
  public ResponseEntity<List<ShareCalendResponse>> getSharedCalendars(
      Authentication connectedUser) {
    return ResponseEntity.ok(shareCalendService.getShareCalend(connectedUser));
  }
  
  @GetMapping("/shared-friends")
  public ResponseEntity<List<SharedFriendDTO>> getSharedFriendIds(
      @RequestParam("calendarId") Integer calendarId,
      Authentication connectedUser) {
    List<SharedFriendDTO> sharedIds = shareCalendService.getSharedFriendIds(calendarId, connectedUser);
    return ResponseEntity.ok(sharedIds);
  }

  @GetMapping("/events/{calendarId}")
  public ResponseEntity<List<EventResponse>> getEventsFromSharedCalendar(
          @PathVariable Integer calendarId,
          Authentication connectedUser
  ) {
      try {
          User user = (User) connectedUser.getPrincipal();
          List<Event> events = shareCalendService.getEventsFromSharedCalendar(user, calendarId);
          List<EventResponse> response = events.stream()
              .map(event -> eventMapper.toEventResponse(event, user.getId()))
              .collect(Collectors.toList());
          return ResponseEntity.ok(response);
      } catch (Exception e) {
          e.printStackTrace(); // vezi stacktrace-ul în consolă
          return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
      }
  }

  
  @DeleteMapping
  public ResponseEntity<String> unshareCalendar(
          @RequestParam("calendarId") Integer calendarId,
          @RequestParam("friendId") Integer friendId,
          Authentication connectedUser) {
      shareCalendService.unshareCalendar(calendarId, friendId, connectedUser);
      return ResponseEntity.ok("Calendar unshared successfully.");
  }

  @PatchMapping
  public ResponseEntity<String> updatePermission(
          @RequestParam("calendarId") Integer calendarId,
          @RequestParam("friendId") Integer friendId,
          @RequestParam("permission") CalendarPermission newPermission,
          Authentication connectedUser) {
      shareCalendService.updatePermission(calendarId, friendId, newPermission, connectedUser);
      return ResponseEntity.ok("Permission updated successfully.");
  }

  
}
