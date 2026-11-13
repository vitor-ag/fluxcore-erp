package com.fluxcore.fluxcore_erp.repository;
import com.fluxcore.fluxcore_erp.domain.Cliente; import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface ClienteRepository extends JpaRepository<Cliente,Long>{List<Cliente> findAllByOrderByNomeAsc();}
