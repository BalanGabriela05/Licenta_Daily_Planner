package com.example.demo.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TokenRepository extends JpaRepository<Token, Integer> {

  Optional<Token> findByToken(String token); //optional is used to avoid null pointer exception
  
}
