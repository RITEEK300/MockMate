package com.mockmate.backend.service;

import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.mockmate.backend.dto.AuthRequest;
import com.mockmate.backend.dto.AuthResponse;
import com.mockmate.backend.dto.SignupRequest;
import com.mockmate.backend.model.User;
import com.mockmate.backend.repository.UserRepository;
import com.mockmate.backend.security.JwtService;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse signup(SignupRequest request) {
        try {
            String normalizedEmail = request.email().trim().toLowerCase();

            if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
                log.warn("Signup attempt with existing email: {}", normalizedEmail);
                throw new ResponseStatusException(BAD_REQUEST, "Email already in use");
            }

            User user = new User(
                    request.name().trim(),
                    normalizedEmail,
                    passwordEncoder.encode(request.password()),
                    Instant.now()
            );
            User saved = userRepository.save(user);
            log.info("User signed up successfully: {}", saved.getId());
            return buildResponse(saved);

        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Signup failed: {}", ex.getMessage(), ex);
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR, "Signup failed: " + ex.getMessage());
        }
    }

    public AuthResponse login(AuthRequest request) {
        try {
            String normalizedEmail = request.email().trim().toLowerCase();

            User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                    .orElseThrow(() -> {
                        log.warn("Login attempt with non-existent email: {}", normalizedEmail);
                        return new ResponseStatusException(UNAUTHORIZED, "Invalid email or password");
                    });

            if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
                log.warn("Login attempt with wrong password for email: {}", normalizedEmail);
                throw new ResponseStatusException(UNAUTHORIZED, "Invalid email or password");
            }

            log.info("User logged in successfully: {}", user.getId());
            return buildResponse(user);

        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Login failed: {}", ex.getMessage(), ex);
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR, "Login failed: " + ex.getMessage());
        }
    }

    private AuthResponse buildResponse(User user) {
        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail());
    }
}
