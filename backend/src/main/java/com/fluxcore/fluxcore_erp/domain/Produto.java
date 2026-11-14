package com.fluxcore.fluxcore_erp.domain;
import jakarta.persistence.*; import jakarta.validation.constraints.*; import java.math.BigDecimal;
@Entity
@Table(name = "produtos")
 public class Produto {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) @org.hibernate.annotations.JdbcTypeCode(java.sql.Types.INTEGER) private Long id;
 @NotBlank private String nome; private String sku; @Column(name = "categoria_texto") private String categoria;
 @NotNull @DecimalMin("0.00") @Column(name = "preco_venda") private BigDecimal preco=BigDecimal.ZERO;
 @NotNull @Min(0) @Column(name = "quantidade_atual") @org.hibernate.annotations.JdbcTypeCode(java.sql.Types.DECIMAL) private Integer quantidade=0; @Min(0) @org.hibernate.annotations.JdbcTypeCode(java.sql.Types.DECIMAL) private Integer estoqueMinimo=0;
 public Produto(){} public Long getId(){return id;} public void setId(Long v){id=v;} public String getNome(){return nome;} public void setNome(String v){nome=v;} public String getSku(){return sku;} public void setSku(String v){sku=v;} public String getCategoria(){return categoria;} public void setCategoria(String v){categoria=v;} public BigDecimal getPreco(){return preco;} public void setPreco(BigDecimal v){preco=v;} public Integer getQuantidade(){return quantidade;} public void setQuantidade(Integer v){quantidade=v;} public Integer getEstoqueMinimo(){return estoqueMinimo;} public void setEstoqueMinimo(Integer v){estoqueMinimo=v;}
}
