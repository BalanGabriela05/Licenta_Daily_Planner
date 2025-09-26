package com.example.demo.calendar.share;


import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.example.demo.calendar.Calendar;
import com.example.demo.calendar.CalendarRepository;
import com.example.demo.event.Event;
import com.example.demo.user.User;
import com.example.demo.user.UserRepository;
import com.example.demo.user.friend.FriendRepository;
import com.example.demo.user.friend.FriendStatus;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShareCalendService {
        
        private final ShareCalendRepository shareCalendRepository;
        private final CalendarRepository calendarRepository;
        private final UserRepository userRepository;
        private final FriendRepository friendRepository;

        public void shareCalendar(ShareCalendRequest request, Authentication connectedUser) {
                User owner = (User) connectedUser.getPrincipal();

                Calendar calendar = calendarRepository.findById(request.calendarId())
                        .orElseThrow(() -> new RuntimeException("Calendar not found"));

                // verify if the calendar belongs to the connected user
                if (!calendar.getOwner().getId().equals(owner.getId())) {
                throw new RuntimeException("You are not the owner of this calendar");
                }

                User friend = userRepository.findById(request.friendId())
                        .orElseThrow(() -> new RuntimeException("Friend not found"));

                // verify if the friend is a friend of the owner
                boolean isFriend = friendRepository.findFriendship(owner, friend)
                        .filter(f -> f.getStatus() == FriendStatus.ACCEPTED)
                        .isPresent();

                if (!isFriend) {
                throw new RuntimeException("You can only share calendars with friends");
                }

                // verify if the calendar is already shared with this friend
                boolean alreadyShared = shareCalendRepository.findByCalendarAndSharedWith(calendar, friend).isPresent();
                if (alreadyShared) {
                throw new RuntimeException("Calendar already shared with this friend");
                }

                ShareCalend share = ShareCalend.builder()
                        .calendar(calendar)
                        .sharedWith(friend)
                        .permission(request.permission())
                        .build();

                        shareCalendRepository.save(share);
        }

        public List<ShareCalendResponse> getShareCalend(Authentication connectedUser) {
                User user = (User) connectedUser.getPrincipal();
                return shareCalendRepository.findBySharedWith(user).stream()
                        .map(share -> ShareCalendResponse.builder()
                                .calendarId(share.getCalendar().getId())
                                .calendarName(share.getCalendar().getNameCalendar())
                                .sharedWith(share.getSharedWith().fullName())
                                .color(share.getCalendar().getColor())
                                .permission(share.getPermission())
                                .ownerName(share.getCalendar().getOwner().getFirstname())
                                .build())
                        .collect(Collectors.toList());
        }


        public boolean canEdit(User user, Calendar calendar) {
                return calendar.getOwner().getId().equals(user.getId()) ||
                shareCalendRepository.findByCalendarAndSharedWith(calendar, user)
                                .filter(s -> s.getPermission() == CalendarPermission.EDIT)
                                .isPresent();
        }

        public boolean canView(User user, Calendar calendar) {
                return calendar.getOwner().getId().equals(user.getId()) ||
                shareCalendRepository.findByCalendarAndSharedWith(calendar, user).isPresent();
        }

        @Transactional
        public void unshareCalendar(Integer calendarId, Integer friendId, Authentication connectedUser) {
        User owner = (User) connectedUser.getPrincipal();

        Calendar calendar = calendarRepository.findById(calendarId)
                .orElseThrow(() -> new RuntimeException("Calendar not found"));

        if (!calendar.getOwner().getId().equals(owner.getId())) {
                throw new RuntimeException("You are not the owner of this calendar");
        }

        User friend = userRepository.findById(friendId)
                .orElseThrow(() -> new RuntimeException("Friend not found"));

        ShareCalend share = shareCalendRepository.findByCalendarAndSharedWith(calendar, friend)
                .orElseThrow(() -> new RuntimeException("Calendar is not shared with this user"));

        shareCalendRepository.delete(share);
        }

        @Transactional
        public void updatePermission(Integer calendarId, Integer friendId, CalendarPermission newPermission, Authentication connectedUser) {
                User owner = (User) connectedUser.getPrincipal();

                Calendar calendar = calendarRepository.findById(calendarId)
                        .orElseThrow(() -> new RuntimeException("Calendar not found"));

                if (!calendar.getOwner().getId().equals(owner.getId())) {
                throw new RuntimeException("You are not the owner of this calendar");
                }

                User friend = userRepository.findById(friendId)
                        .orElseThrow(() -> new RuntimeException("Friend not found"));

                ShareCalend share = shareCalendRepository.findByCalendarAndSharedWith(calendar, friend)
                        .orElseThrow(() -> new RuntimeException("Calendar is not shared with this user"));

                share.setPermission(newPermission);
                shareCalendRepository.save(share);
        }

        public List<Event> getEventsFromSharedCalendar(User user, Integer calendarId) {
                // Verifică dacă calendarul este partajat cu userul
                boolean hasAccess = shareCalendRepository.existsSharedAccess(calendarId, user);
                if (!hasAccess) {
                        throw new RuntimeException("You do not have access to this calendar");
                }
                
                return shareCalendRepository.findByCalendarId(calendarId);
        }

        public List<Event> getEventsFromSharedCalendars(User user, LocalDateTime from, LocalDateTime to) {
                // Obține toate calendarele partajate cu utilizatorul
                List<Calendar> sharedCalendars = shareCalendRepository.findBySharedWith(user).stream()
                        .map(ShareCalend::getCalendar)
                        .collect(Collectors.toList());

                // Obține evenimentele din aceste calendare pentru intervalul specificat
                return sharedCalendars.stream()
                        .flatMap(calendar -> calendar.getEvents().stream())
                        .filter(event -> !event.getCreatedBy().getId().equals(user.getId())) // Exclude evenimentele create de utilizatorul logat
                        .filter(event -> !event.getStartTime().isAfter(to) && !event.getEndTime().isBefore(from)) // Filtrează după interval
                        .collect(Collectors.toList());
        }

        public List<SharedFriendDTO> getSharedFriendIds(Integer calendarId, Authentication connectedUser) {
                User owner = (User) connectedUser.getPrincipal();
                Calendar calendar = calendarRepository.findById(calendarId)
                        .orElseThrow(() -> new RuntimeException("Calendar not found"));
                if (!calendar.getOwner().getId().equals(owner.getId())) {
                        throw new RuntimeException("You are not the owner of this calendar");
                }
                return shareCalendRepository.findByCalendar(calendar)
                        .stream()
                        .map(share -> new SharedFriendDTO(
                                share.getSharedWith().getId(),
                                share.getPermission().toString() // sau .toString()
                        ))
                        .collect(Collectors.toList());
                }

}
