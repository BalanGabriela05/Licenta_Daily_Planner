package com.example.demo.auth;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;



@RestController
@RequestMapping("auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
public class AuthenticationController {

  private final AuthenticationService service;

  @PostMapping("/register")
  @ResponseStatus(HttpStatus.ACCEPTED)
  public ResponseEntity<?> register(@RequestBody @Valid RegistrationRequest request) throws MessagingException {
  //@Valid is used to validate the request body 
    service.register(request);
    return ResponseEntity.accepted().build();
  }
  

  // @PostMapping("/authenticate")
  // public ResponseEntity<AutheticationResponse> athenticate(
  //   @RequestBody @Valid AuthenticationRequest request
  // ){
  //   return ResponseEntity.ok(service.authenticate(request));
  // }
  @PostMapping("/authenticate")
  public ResponseEntity<?> athenticate(
    @RequestBody @Valid AuthenticationRequest request,
    HttpServletResponse response // adaugă acest parametru!
  ){
    AutheticationResponse authResponse = service.authenticate(request);

    // Creează cookie-ul HttpOnly cu JWT
    ResponseCookie cookie = ResponseCookie.from("jwt", authResponse.getToken())
        .httpOnly(true)
        .secure(true) // doar pe HTTPS în producție!
        .sameSite("Strict")
        .path("/")
        .maxAge(60 * 60) // 1 oră
        .build();

    response.addHeader("Set-Cookie", cookie.toString());

    // Nu mai trimite tokenul în body către frontend (sau trimite doar datele userului)
    return ResponseEntity.ok(
        Map.of(
            "id", authResponse.getUserId(),
            "email", authResponse.getEmail(),
            "firstname", authResponse.getFirstname()
        )
    );
  }
  @PostMapping("/logout")
  public ResponseEntity<?> logout(HttpServletResponse response) {
      ResponseCookie cookie = ResponseCookie.from("jwt", "")
          .httpOnly(true)
          .secure(true)
          .sameSite("Strict")
          .path("/")
          .maxAge(0)
          .build();
      response.addHeader("Set-Cookie", cookie.toString());
      return ResponseEntity.ok().build();
  }
  
  @GetMapping("/me")
  public ResponseEntity<?> getCurrentUser(Authentication authentication) {
      if (authentication == null || !authentication.isAuthenticated()) {
          return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
      }
      // Cast direct la User!
      var user = (com.example.demo.user.User) authentication.getPrincipal();
      return ResponseEntity.ok(Map.of(
          "id", user.getId(),
          "email", user.getEmail(),
          "firstname", user.getFirstname()
         
      ));
  }
    
  @GetMapping("/activate-account")
  public void confirm(@RequestParam String token) throws MessagingException{
      service.activateAccount(token);
      
  }
  
  
}
