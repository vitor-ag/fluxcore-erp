package com.fluxcore.fluxcore_erp.api;

import jakarta.servlet.DispatcherType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    UserDetailsService userDetailsService(JdbcTemplate jdbc) {
        return email -> jdbc.query("""
                SELECT email, senha_hash, role, ativo FROM usuarios WHERE LOWER(email) = LOWER(?)
                """, rs -> {
            if (!rs.next()) throw new UsernameNotFoundException("Credenciais inválidas.");
            if (!rs.getBoolean("ativo")) throw new UsernameNotFoundException("Credenciais inválidas.");
            String role = rs.getString("role");
            if (role == null || !role.matches("[A-Z_]{1,40}")) role = "USER";
            return User.withUsername(rs.getString("email"))
                    .password(rs.getString("senha_hash"))
                    .authorities("ROLE_" + role)
                    .build();
        }, email);
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    SecurityFilterChain apiSecurity(HttpSecurity http) throws Exception {
        return http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login").permitAll()
                        .requestMatchers("/api/usuarios", "/api/usuarios/**").denyAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/**").hasAnyRole("ADMIN", "USER", "VIEWER")
                        .requestMatchers("/api/auth/profile").hasAnyRole("ADMIN", "USER", "VIEWER")
                        .anyRequest().hasAnyRole("ADMIN", "USER"))
                .httpBasic(Customizer.withDefaults())
                .build();
    }
}
