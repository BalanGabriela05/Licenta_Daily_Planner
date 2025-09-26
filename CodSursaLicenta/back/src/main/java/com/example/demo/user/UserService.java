package com.example.demo.user;

import java.security.Principal;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

  private final PasswordEncoder passwordEncoder;
  private final UserRepository userRepository;

  public void changePassword(ChangePasswordRequest request, Principal connectedUser ) {
    
    var user = (User) ((UsernamePasswordAuthenticationToken) connectedUser).getPrincipal(); // Cast the Principal to User

    //check if the current password is correct
    if(!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
      throw new IllegalStateException("Current password is incorrect");
    }

    if(!request.getNewPassword().equals(request.getConfirmationPassword())) {
      throw new IllegalStateException("New password and confirmation password do not match");
    }

    user.setPassword(passwordEncoder.encode(request.getNewPassword())); 
    userRepository.save(user); // Save the updated user with the new password

  }
}
