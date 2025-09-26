package com.example.demo.user.friend;


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

public class FriendResponse {

  private Integer id; // id of the friend request
  private Integer senderId;
  private Integer receiverId;
  private FriendStatus status;
  private String senderEmail;
  private String senderName;
  private String receiverEmail;
  private String receiverName;

  
}
