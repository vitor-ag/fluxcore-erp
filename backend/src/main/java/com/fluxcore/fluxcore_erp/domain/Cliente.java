package com.fluxcore.fluxcore_erp.domain;
import jakarta.persistence.*; import jakarta.validation.constraints.*;
@Entity
@Table(name = "clientes")
 public class Cliente {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @org.hibernate.annotations.JdbcTypeCode(java.sql.Types.INTEGER) private Long id;
 @NotBlank private String nome; @Column(name = "cpf_cnpj") private String documento; @Email private String email; private String telefone; private String tipo="Pessoa física";
 public Cliente(){} public Long getId(){return id;} public void setId(Long v){id=v;} public String getNome(){return nome;} public void setNome(String v){nome=v;} public String getDocumento(){return documento;} public void setDocumento(String v){documento=v;} public String getEmail(){return email;} public void setEmail(String v){email=v;} public String getTelefone(){return telefone;} public void setTelefone(String v){telefone=v;} public String getTipo(){return tipo;} public void setTipo(String v){tipo=v;}
}
