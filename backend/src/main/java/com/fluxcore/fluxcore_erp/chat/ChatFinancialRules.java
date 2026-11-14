package com.fluxcore.fluxcore_erp.chat;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.util.Locale;
import java.util.Set;

final class ChatFinancialRules {
    private ChatFinancialRules() {}
    static boolean settled(String status) {
        return status != null && Set.of("pago", "recebido", "confirmado", "confirmada")
                .contains(status.toLowerCase(Locale.ROOT));
    }
    static boolean cancelled(String status) {
        return status != null && Set.of("cancelado", "cancelada").contains(status.toLowerCase(Locale.ROOT));
    }
    static boolean pending(String status) { return !settled(status) && !cancelled(status); }
    static BigDecimal cents(BigDecimal value) { return value.setScale(2, RoundingMode.HALF_UP); }
    static String brl(BigDecimal value) {
        return NumberFormat.getCurrencyInstance(Locale.forLanguageTag("pt-BR")).format(value);
    }
}
