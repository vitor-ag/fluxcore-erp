ALTER TABLE clientes ADD COLUMN tipo VARCHAR(255);
ALTER TABLE produtos ADD COLUMN sku VARCHAR(255), ADD COLUMN categoria_texto VARCHAR(255);
ALTER TABLE lancamentos_financeiros ADD COLUMN categoria_texto VARCHAR(255);
