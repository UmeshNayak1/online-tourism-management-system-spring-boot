package com.tourism.service;

import com.tourism.model.User;
import com.tourism.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public User update(Long id, User input) {
        User user = findById(id);
        user.setName(input.getName());
        user.setEmail(input.getEmail());
        user.setPhone(input.getPhone());
        user.setRole(input.getRole());
        if (input.getPassword() != null && !input.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(input.getPassword()));
        }
        return userRepository.save(user);
    }

    public void delete(Long id) {
        userRepository.delete(findById(id));
    }
}
