UPDATE produtos SET ativo = TRUE WHERE ativo IS NULL;
ALTER TABLE produtos ALTER COLUMN ativo SET DEFAULT TRUE;
UPDATE lancamentos_financeiros SET tipo = 'Entrada' WHERE tipo = 'RECEITA';
UPDATE lancamentos_financeiros SET tipo = 'Saída' WHERE tipo = 'DESPESA';
