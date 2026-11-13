package com.fluxcore.fluxcore_erp.repository;
import com.fluxcore.fluxcore_erp.domain.Lancamento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface LancamentoRepository extends JpaRepository<Lancamento,Long> { List<Lancamento> findAllByOrderByDataDesc(); }
