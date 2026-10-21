package com.fluxcore.fluxcore_erp.api;

import java.time.LocalDateTime;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthController(JdbcTemplate jdbc, PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager) {
        this.jdbc = jdbc;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/register")
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {
        validateBcryptLength(request.senha());
        Integer exists = jdbc.queryForObject("SELECT COUNT(*) FROM usuarios WHERE LOWER(email) = LOWER(?)",
                Integer.class, request.email().trim());
        if (exists != null && exists > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um usuário com este e-mail.");
        }
        jdbc.update("""
                INSERT INTO usuarios (nome, email, senha_hash, role, ativo, criado_em)
                VALUES (?, ?, ?, 'USER', TRUE, ?)
                """, request.nome().trim(), request.email().trim().toLowerCase(),
                passwordEncoder.encode(request.senha()), LocalDateTime.now());
        return jdbc.queryForObject("""
                SELECT id, nome, email, role, ativo, criado_em FROM usuarios WHERE LOWER(email) = LOWER(?)
                """, (rs, row) -> new UserResponse(rs.getInt("id"), rs.getString("nome"),
                rs.getString("email"), rs.getString("role"), rs.getBoolean("ativo"),
                rs.getTimestamp("criado_em").toLocalDateTime()), request.email().trim());
    }

    @PostMapping("/login")
    public UserResponse login(@Valid @RequestBody LoginRequest request) {
        validateBcryptLength(request.senha());
        Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(request.email().trim(), request.senha()));
        return jdbc.queryForObject("""
                SELECT id, nome, email, role, ativo, criado_em FROM usuarios WHERE LOWER(email) = LOWER(?)
                """, (rs, row) -> new UserResponse(rs.getInt("id"), rs.getString("nome"),
                rs.getString("email"), rs.getString("role"), rs.getBoolean("ativo"),
                rs.getTimestamp("criado_em").toLocalDateTime()), authentication.getName());
    }

    public record RegisterRequest(@NotBlank @Size(max = 255) String nome,
                                  @NotBlank @Email @Size(max = 255) String email,
                                  @NotBlank @Size(min = 8, max = 72) String senha) {}

    public record LoginRequest(@NotBlank @Email @Size(max = 255) String email,
                               @NotBlank @Size(max = 72) String senha) {}

    public record UserResponse(int id, String nome, String email, String role,
                               boolean ativo, LocalDateTime criado_em) {}

    private void validateBcryptLength(String password) {
        if (password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A senha não pode exceder 72 bytes em UTF-8.");
        }
    }
}
