package com.example.demo.user.friend;

import jakarta.validation.constraints.NotNull;

public record FriendRequest(

    @NotNull(message = "Receiver email is required")
    String receiverEmail
    //Integer receiverId
) {
}
