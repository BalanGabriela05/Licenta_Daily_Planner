package com.example.demo.user.friend;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.demo.user.User;


public interface FriendRepository extends JpaRepository<Friend, Integer> {


    @Query("SELECT f FROM Friend f WHERE (f.userSender = :user1 AND f.userReceiver = :user2) OR (f.userSender = :user2 AND f.userReceiver = :user1)")
    Optional<Friend> findFriendship(User user1, User user2);


    // find all the friends of the user
    @Query("""
    SELECT f FROM Friend f
    WHERE (f.userSender = :user OR f.userReceiver = :user)
    AND f.status = 'ACCEPTED'
    """)
    List<Friend> findFriends(@Param("user") User user);

    @Query("""
    SELECT f FROM Friend f
    WHERE f.userReceiver = :user AND f.status = 'PENDING'
    """)
    List<Friend> findPendingReceivedRequests(@Param("user") User user);

    @Query("""
        SELECT f FROM Friend f
        WHERE f.userSender = :user AND f.status = 'PENDING'
    """)
    List<Friend> findPendingSentRequests(@Param("user") User user);
    



}
