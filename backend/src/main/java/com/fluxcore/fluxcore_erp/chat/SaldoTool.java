package com.fluxcore.fluxcore_erp.chat;

import com.fluxcore.fluxcore_erp.repository.LancamentoRepository;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SaldoTool {
    private final LancamentoRepository repository;

    public SaldoTool(LancamentoRepository repository) { this.repository = repository; }

    public record Saldo(BigDecimal entradasConcluidas, BigDecimal saidasConcluidas,
            BigDecimal saldoRealizado, String entradasFormatadas, String saidasFormatadas,
            String saldoFormatado, int quantidadeConcluidos, boolean semLancamentos) {}

    @Transactional(readOnly = true)
    public Saldo consultar() {
        var items = repository.findAll();
        var entradas = BigDecimal.ZERO.setScale(2);
        var saidas = BigDecimal.ZERO.setScale(2);
        int quantidade = 0;
        for (var item : items) {
            var status = item.getStatus();
            if (!ChatFinancialRules.settled(status)) continue;
            // A interface arredonda cada lançamento para centavos antes de somar.
            var valor = ChatFinancialRules.cents(item.getValor());
            if ("Entrada".equals(item.getTipo())) entradas = entradas.add(valor);
            else saidas = saidas.add(valor);
            quantidade++;
        }
        var saldo = entradas.subtract(saidas);
        var brl = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("pt-BR"));
        return new Saldo(entradas, saidas, saldo, brl.format(entradas), brl.format(saidas),
                brl.format(saldo), quantidade, items.isEmpty());
    }
}
