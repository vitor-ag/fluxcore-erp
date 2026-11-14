package com.fluxcore.fluxcore_erp.api;
import com.fluxcore.fluxcore_erp.domain.Lancamento;
import com.fluxcore.fluxcore_erp.repository.LancamentoRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/lancamentos")
public class LancamentoController {
    private final LancamentoRepository repo;
    public LancamentoController(LancamentoRepository repo){this.repo=repo;}
    @GetMapping List<Lancamento> listar(){return repo.findAllByOrderByDataDesc();}
    @PostMapping @ResponseStatus(HttpStatus.CREATED) Lancamento criar(@Valid @RequestBody Lancamento item){return repo.save(item);}
    @PutMapping("/{id}") Lancamento atualizar(@PathVariable Long id,@Valid @RequestBody Lancamento item){if(!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);item.setId(id);return repo.save(item);}
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) void excluir(@PathVariable Long id){if(!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);repo.deleteById(id);}
    @GetMapping("/resumo") Map<String,Object> resumo(){
      var items=repo.findAll(); BigDecimal entradas=BigDecimal.ZERO,saidas=BigDecimal.ZERO;
      for(var i:items){if("Entrada".equalsIgnoreCase(i.getTipo())) entradas=entradas.add(i.getValor()); else saidas=saidas.add(i.getValor());}
      return Map.of("entradas",entradas,"saidas",saidas,"saldo",entradas.subtract(saidas),"total",items.size(),"lancamentos",repo.findAllByOrderByDataDesc());
    }
}
