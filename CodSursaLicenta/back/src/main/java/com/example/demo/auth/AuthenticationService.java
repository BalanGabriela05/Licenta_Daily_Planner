package com.example.demo.auth;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.calendar.Calendar;
import com.example.demo.calendar.CalendarRepository;
import com.example.demo.email.EmailService;
import com.example.demo.email.EmailTemplateName;
import com.example.demo.role.RoleRepository;
import com.example.demo.security.JwtService;
import com.example.demo.user.Token;
import com.example.demo.user.TokenRepository;
import com.example.demo.user.User;
import com.example.demo.user.UserRepository;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

  private final RoleRepository roleRepository;
  private final PasswordEncoder passwordEncoder;
  private final UserRepository userRepository;
  private final TokenRepository tokenRepository;
  private final EmailService emailService;
  private final AuthenticationManager authenticationManager;
  private final JwtService jwtService;
  private final CalendarRepository calendarRepository;

  @Value("${application.mailing.frontend.activation-url}")
  private String activationUrl;

//Steps:
//1. Set by default the role of the user to be USER
//2. Save the user to the database
//3. Send a confirmation email to the user
  public void register(RegistrationRequest request) throws MessagingException { 
    var userRole =  roleRepository.findByName("USER").orElseThrow(() -> new RuntimeException("Error: Role is not found."));

    var user = User.builder()
        .firstname(request.getFirstname())
        .lastname(request.getLastname())
        .email(request.getEmail())
        .password(passwordEncoder.encode(request.getPassword()))
        .accountLocked(false)
        .enabled(false)
        .roles(List.of(userRole))
        .build();

    //asign a default calendar to the user
    Calendar defaultCalendar = Calendar.builder()
        .nameCalendar(user.getFirstname() + "'s calendar")
        .owner(user)
        .color("#8174A0") //default color
        .isPrimary(true)
        .build();
    
    userRepository.save(user);
    sendValidationEmail(user);
    calendarRepository.save(defaultCalendar);

  }

  private void sendValidationEmail(User user) throws MessagingException {
    var newToken = generateAndSaveActivationToken(user);
    //send email
    emailService.sendEmail(user.getEmail(), user.fullName(), EmailTemplateName.ACTIVATE_ACCOUNT, activationUrl, newToken, "Account Activation");
  }

  private String generateAndSaveActivationToken(User user) {
    //generate token
    String generatedToken = generateActivationCode(6);
    var token = Token.builder()
        .token(generatedToken)
        .createdAt(LocalDateTime.now())
        .expiresAt(LocalDateTime.now().plusMinutes(15))
        .user(user)
        .build();
    tokenRepository.save(token);
    return generatedToken;
  }

  private String generateActivationCode(int length) {
    String characters = "0123456789";
    StringBuilder codeBuilder = new StringBuilder();
    SecureRandom secureRandom = new SecureRandom(); // cryptographically strong 
    for (int i = 0; i < length; i++) {
      int randomIndex = secureRandom.nextInt(characters.length());
      codeBuilder.append(characters.charAt(randomIndex));
    }
    return codeBuilder.toString();
  }

  public AutheticationResponse authenticate(AuthenticationRequest request){
    var auth = authenticationManager.authenticate(
      new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
    );
    var claims = new HashMap<String, Object>();
    var user = ((User)auth.getPrincipal());
    claims.put("fullName", user.fullName());
    var jwtToken = jwtService.generateToken(claims, user);
    return AutheticationResponse.builder()
                                .token(jwtToken)
                                .userId(user.getId())
                                .email(user.getEmail())
                                .firstname(user.getFirstname())
                                .build();
  }

// @Transactional
  public void activateAccount(String token) throws MessagingException {
    Token savedToken = tokenRepository.findByToken(token)
        .orElseThrow(() -> new RuntimeException("Error: Token not found"));
    if(LocalDateTime.now().isAfter(savedToken.getExpiresAt())){
      sendValidationEmail(savedToken.getUser());
      throw new RuntimeException("Error: Token expired. A new one has been sent to your email.");
    }
    var user = userRepository.findById(savedToken.getUser().getId())
        .orElseThrow(() -> new UsernameNotFoundException("Error: User not found"));
    user.setEnabled(true);
    userRepository.save(user);
    savedToken.setValidatedAt(LocalDateTime.now());
    tokenRepository.save(savedToken); //update the new token
  }


}
