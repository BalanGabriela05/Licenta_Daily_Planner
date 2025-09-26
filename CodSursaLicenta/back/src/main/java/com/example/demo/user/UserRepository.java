package com.example.demo.user;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Integer> {

  Optional<User> findByEmail(String email);

  // search email (including partial matches)
  @Query("""
      SELECT u FROM User u
      WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%'))
      """)
  List<User> searchUserByEmail(@Param("query") String query);


  
}
