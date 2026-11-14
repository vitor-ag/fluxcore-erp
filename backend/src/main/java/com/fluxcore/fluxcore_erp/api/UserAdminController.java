package com.fluxcore.fluxcore_erp.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/admin/usuarios")
public class UserAdminController {
    private final JdbcTemplate jdbc;

    public UserAdminController(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @org.springframework.context.event.EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    public void bootstrapAdministrator() {
        String email = System.getenv("FLUXCORE_ADMIN_EMAIL");
        if (email == null || email.isBlank()) return;
        jdbc.update("""
                UPDATE usuarios SET role = 'ADMIN'
                WHERE email = ? AND ativo = TRUE
                """, email.trim());
    }

    @GetMapping
    public Object users() {
        return jdbc.queryForList("SELECT id, nome, email, role, ativo FROM usuarios ORDER BY nome, id");
    }

    @PutMapping("/{id}")
    public void update(@PathVariable int id, @Valid @RequestBody Access access, Authentication auth) {
        int changed = jdbc.update("""
                UPDATE usuarios SET role = ?, ativo = ? WHERE id = ? AND email <> ?
                """, access.role(), access.ativo(), id, auth.getName());
        if (changed == 0) throw new ResponseStatusException(HttpStatus.CONFLICT, "Usuário inexistente ou conta atual.");
    }

    record Access(@NotNull @Pattern(regexp = "ADMIN|USER|VIEWER") String role, @NotNull Boolean ativo) {}
}
