package com.fluxcore.fluxcore_erp.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "lancamentos_financeiros")

public class Lancamento {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @org.hibernate.annotations.JdbcTypeCode(java.sql.Types.INTEGER) private Long id;
    @NotBlank private String descricao;
    @NotNull @DecimalMin("0.01") private BigDecimal valor;
    @NotBlank private String tipo;
    @NotNull @Column(name = "data_vencimento") private LocalDate data;
    @Column(name = "categoria_texto") private String categoria;
    private String status = "Pendente";
    public Lancamento() {}
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getDescricao(){return descricao;} public void setDescricao(String v){this.descricao=v;}
    public BigDecimal getValor(){return valor;} public void setValor(BigDecimal v){this.valor=v;}
    public String getTipo(){return tipo;} public void setTipo(String v){this.tipo=v;}
    public LocalDate getData(){return data;} public void setData(LocalDate v){this.data=v;}
    public String getCategoria(){return categoria;} public void setCategoria(String v){this.categoria=v;}
    public String getStatus(){return status;} public void setStatus(String v){this.status=v;}
}
