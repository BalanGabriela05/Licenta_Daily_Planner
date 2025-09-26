package com.example.demo.user.friend;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/friends")
@RequiredArgsConstructor
@Tag(name = "Friend")
public class FriendController {

    private final FriendService friendService;
 
    @PostMapping
    public ResponseEntity<String> sendFriendRequest(
            @Valid @RequestBody FriendRequest request,
            Authentication connectedUser
    ) {
        friendService.sendFriendRequest(request, connectedUser);
        return ResponseEntity.ok("Friend request sent!");
    }

    @PostMapping("/{friendId}/respond")
    public ResponseEntity<String> respondToFriendRequest(
            @PathVariable Integer friendId,
            @RequestParam boolean accept,
            Authentication connectedUser
    ) {
        friendService.respondToFriendRequest(friendId, accept, connectedUser);
        return ResponseEntity.ok(accept ? "Friend request accepted!" : "Friend request rejected!");
    }

 
    @GetMapping
    public ResponseEntity<List<FriendResponse>> getFriends(Authentication connectedUser) {
        List<FriendResponse> friends = friendService.getFriends(connectedUser);
        return ResponseEntity.ok(friends);
    }

    @GetMapping("/received-pending")
    public ResponseEntity<List<FriendResponse>> getReceivedPendingRequests(Authentication connectedUser) {
        List<FriendResponse> pendingReceived = friendService.getPendingReceivedRequests(connectedUser);
        return ResponseEntity.ok(pendingReceived);
    }

    @GetMapping("/sent-pending")
    public ResponseEntity<List<FriendResponse>> getSentPendingRequests(Authentication connectedUser) {
        List<FriendResponse> pendingSent = friendService.getPendingSentRequests(connectedUser);
        return ResponseEntity.ok(pendingSent);
    }

    @DeleteMapping("/{friendId}")
    public ResponseEntity<String> deleteFriend(@PathVariable Integer friendId, Authentication connectedUser) {
        friendService.deleteFriend(friendId, connectedUser);
        return ResponseEntity.ok("Friendship deleted successfully.");
    }




}
