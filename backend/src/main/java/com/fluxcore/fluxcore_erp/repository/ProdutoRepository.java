package com.fluxcore.fluxcore_erp.repository;
import com.fluxcore.fluxcore_erp.domain.Produto; import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface ProdutoRepository extends JpaRepository<Produto,Long>{List<Produto> findAllByOrderByNomeAsc();}
