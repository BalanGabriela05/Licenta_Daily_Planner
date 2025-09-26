package com.example.demo.auth;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class AutheticationResponse {
  private String token;
  private Integer userId;
  private String email;
  private String firstname;
}
