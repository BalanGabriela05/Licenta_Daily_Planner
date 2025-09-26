package com.example.demo.user.friend;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import com.example.demo.user.User;
import com.example.demo.user.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FriendService {
  
  private final FriendRepository friendRepository;
  private final UserRepository userRepository;
  
  public void sendFriendRequest(FriendRequest request, Authentication connectedUserSender) {

    User sender = (User) connectedUserSender.getPrincipal();
    // User receiver = userRepository.findById(request.receiverId()).orElseThrow(() -> new RuntimeException("No user found with id " + request.receiverId()));
    User receiver = userRepository.findByEmail(request.receiverEmail())
        .orElseThrow(() -> new RuntimeException("No user found with email " + request.receiverEmail()));


    // verify if the sender and receiver are the same
    if (sender.getId().equals(receiver.getId())) {
      throw new RuntimeException("You cannot send a friend request to yourself!");
  }
    System.err.println("!!!!!!Sender: " + sender.getId() + " Receiver: " + receiver.getId());
    // veirify is already exists a friendship request/ are already friends
    Optional<Friend> existingFriendship = friendRepository.findFriendship(sender, receiver);
    if (existingFriendship.isPresent()) {
      Friend friendship = existingFriendship.get();
      if (friendship.getStatus() == FriendStatus.ACCEPTED) {
        throw new RuntimeException("You are already friends!");
      } else if (friendship.getStatus() == FriendStatus.PENDING) {
        throw new RuntimeException("A friend request is already pending.");
      }
    } 

    // save the friend request
    Friend friendRequest = new Friend();
    friendRequest.setUserSender(sender);
    friendRequest.setUserReceiver(receiver);
    friendRequest.setStatus(FriendStatus.PENDING);
    friendRepository.save(friendRequest);
    
  }

  public void respondToFriendRequest(Integer friendId, boolean accept, Authentication connectedUserReceiver) {
    User receiver = (User) connectedUserReceiver.getPrincipal();

    // verify if the friend request exists
    Friend friendRequest  = friendRepository.findById(friendId).orElseThrow(() -> new RuntimeException("No friend request found with id " + friendId));

    // verify if the user is the receiver of the friend request
    if (!friendRequest.getUserReceiver().getId().equals(receiver.getId())) {
      throw new RuntimeException("You do not have permission to respond to this friend request");
    }

    // verify if the friend request is pending
    if (!friendRequest.getStatus().equals(FriendStatus.PENDING)) {
      throw new RuntimeException("This friend request is not pending");
    }

    // update the friend request
    if (accept) {
      friendRequest.setStatus(FriendStatus.ACCEPTED);
      friendRepository.save(friendRequest);
    } else {
      friendRepository.delete(friendRequest); // delete the friend request if it is rejected
    }
  }

  public List<FriendResponse> getFriends(Authentication authentication) {
    User user = (User) authentication.getPrincipal();

    List<Friend> friends = friendRepository.findFriends(user);

    return friends.stream()
            .map(friend -> new FriendResponse(
                friend.getId(),
                friend.getUserSender().getId(),
                friend.getUserReceiver().getId(),
                friend.getStatus(),
                friend.getUserSender().getEmail(),
                friend.getUserSender().fullName(),
                friend.getUserReceiver().getEmail(),
                friend.getUserReceiver().fullName()
            ))
            .collect(Collectors.toList());
  }

  public List<FriendResponse> getPendingReceivedRequests(Authentication authentication) {
    User user = (User) authentication.getPrincipal();

    List<Friend> pendingReceived = friendRepository.findPendingReceivedRequests(user);

    return pendingReceived.stream()
            .map(friend -> new FriendResponse(
                friend.getId(),
                friend.getUserSender().getId(),
                friend.getUserReceiver().getId(),
                friend.getStatus(),
                friend.getUserSender().getEmail(),
                friend.getUserSender().fullName(),
                friend.getUserReceiver().getEmail(),
                friend.getUserReceiver().fullName()
            ))
            .collect(Collectors.toList());
  }

  public List<FriendResponse> getPendingSentRequests(Authentication authentication) {
    User user = (User) authentication.getPrincipal();

    List<Friend> pendingSent = friendRepository.findPendingSentRequests(user);

    return pendingSent.stream()
            .map(friend -> new FriendResponse(
                friend.getId(),
                friend.getUserSender().getId(),
                friend.getUserReceiver().getId(),
                friend.getStatus(),
                friend.getUserSender().getEmail(),
                friend.getUserSender().fullName(),
                friend.getUserReceiver().getEmail(),
                friend.getUserReceiver().fullName()
            ))
            .collect(Collectors.toList());
  }

  public void deleteFriend(Integer friendId, Authentication authentication) {
    User user = (User) authentication.getPrincipal();
  System.err.println("User: " + user.getId());
    Friend friend = friendRepository.findById(friendId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Friendship not found"));

            System.err.println("Friend: " + friend.getUserSender().getId() + " " + friend.getUserReceiver().getId());
    if (!friend.getUserSender().equals(user) && !friend.getUserReceiver().equals(user)) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not part of this friendship");
    }

    friendRepository.delete(friend);
  }




}
