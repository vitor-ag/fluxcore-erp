ALTER TABLE usuarios
    ADD CONSTRAINT uk_usuarios_email UNIQUE (email);
