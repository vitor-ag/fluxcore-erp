param(
  [string]$Api = 'http://127.0.0.1:8080/api',
  [Parameter(Mandatory)][string]$Senha
)
$ErrorActionPreference = 'Stop'
$email = 'apresentacao@fluxcore.example'
$auth = @{ nome = 'Mercearia Aurora • Demonstração'; email = $email; senha = $Senha }
function Call($method, $path, $data) {
  $params = @{ Method = $method; Uri = "$Api/$path"; Headers = $headers; TimeoutSec = 15 }
  if ($null -ne $data) { $params.ContentType = 'application/json'; $params.Body = ConvertTo-Json -Depth 8 -InputObject $data }
  foreach ($record in (Invoke-RestMethod @params)) { $record }
}
$headers = @{}
try { $null = Call Post 'auth/register' $auth }
catch { if ([int]$_.Exception.Response.StatusCode -ne 409) { throw } }
$headers.Authorization = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("${email}:$Senha"))
$null = Call Get 'auth/profile'
function Ensure($path, $key, $data) {
  $found = @(Call Get $path | Where-Object { $_.$key -eq $data[$key] })
  if ($found.Count) { return $found[0] }
  Call Post $path $data
}
$customer = Ensure clientes nome @{ nome = 'Demo • Café Jardim'; email = 'cafe@fluxcore.example'; tipo = 'Pessoa jurídica' }
$supplier = Ensure fornecedores nome @{ nome = 'Demo • Distribuidora Horizonte'; email = 'horizonte@fluxcore.example' }
$bank = Ensure contas_financeiras nome @{ nome = 'Demo • Banco Aurora'; tipo = 'Banco'; saldo_atual = 1700 }
$null = Ensure contas_financeiras nome @{ nome = 'Demo • Caixa da loja'; tipo = 'Caixa'; saldo_atual = 350 }
$rice = Ensure produtos sku @{ sku = 'DEMO-ARROZ'; nome = 'Demo • Arroz integral 1 kg'; preco = 14.90; quantidade = 32; estoqueMinimo = 10; categoria = 'Mercearia' }
$coffee = Ensure produtos sku @{ sku = 'DEMO-CAFE'; nome = 'Demo • Café torrado 500 g'; preco = 28.90; quantidade = 8; estoqueMinimo = 10; categoria = 'Bebidas' }
$null = Ensure produtos sku @{ sku = 'DEMO-AZEITE'; nome = 'Demo • Azeite 500 ml'; preco = 42.90; quantidade = 17; estoqueMinimo = 5; categoria = 'Mercearia' }
foreach ($category in @(@{ nome='Demo • Varejo'; tipo='Entrada' }, @{ nome='Demo • Reposição'; tipo='Saída' }, @{ nome='Demo • Energia'; tipo='Saída' })) {
  $null = Ensure categorias_financeiras nome $category
}
$now = Get-Date
$month = Get-Date -Year $now.Year -Month $now.Month -Day 1 -Hour 0 -Minute 0 -Second 0
for ($offset = 0; $offset -le 6; $offset++) {
  $date = $month.AddMonths(-$offset).ToString('yyyy-MM-dd')
  foreach ($item in @(
    @{ descricao="Demo • Varejo $date"; tipo='Entrada'; categoria='Demo • Varejo'; valor=(4250 - $offset*210) },
    @{ descricao="Demo • Reposição $date"; tipo='Saída'; categoria='Demo • Reposição'; valor=(2450 - $offset*120) },
    @{ descricao="Demo • Energia $date"; tipo='Saída'; categoria='Demo • Energia'; valor=(390 - $offset*15) }
  )) {
    $item.data = $date
    $item.status = 'Pago'
    $item.contaFinanceiraId = $bank.id
    $null = Ensure lancamentos descricao $item
  }
}
$today = $now.ToString('yyyy-MM-dd')
$due = $now.AddDays(12).ToString('yyyy-MM-dd')
$prior = @(Call Get 'vendas' | Where-Object { $_.cliente_id -eq $customer.id })
if (!$prior.Count) {
  $before = (Call Get "produtos" | Where-Object id -eq $rice.id).quantidade
  $sale = Call Post 'vendas/confirmar' @{ clienteId=$customer.id; formaPagamento='Pix'; dataVencimento=$due; contaFinanceiraId=$bank.id; itens=@(@{produtoId=$rice.id; quantidade=6}) }
  $after = (Call Get 'produtos' | Where-Object id -eq $rice.id).quantidade
  $ledger = Call Get 'lancamentos' | Where-Object id -eq $sale.lancamento_financeiro_id
  if ($after -ne ($before - 6) -or $ledger.tipo -ne 'Entrada' -or $ledger.status -ine 'Pendente') { throw 'Venda não refletiu no estoque e nas contas a receber.' }
}
$before = (Call Get 'produtos' | Where-Object id -eq $rice.id).quantidade
try {
  $null = Call Post 'vendas/confirmar' @{ clienteId=$customer.id; formaPagamento='Pix'; dataVencimento=$due; itens=@(@{produtoId=$rice.id; quantidade=($before + 100)}) }
  throw 'Venda acima do estoque foi aceita.'
} catch { if ($null -eq $_.Exception.Response -or [int]$_.Exception.Response.StatusCode -ne 422) { throw } }
if ((Call Get 'produtos' | Where-Object id -eq $rice.id).quantidade -ne $before) { throw 'Venda rejeitada alterou estoque.' }
if (!@(Call Get 'compras' | Where-Object { $_.fornecedor_id -eq $supplier.id }).Count) {
  $before = (Call Get 'produtos' | Where-Object id -eq $coffee.id).quantidade
  $purchase = Call Post 'compras/confirmar' @{ fornecedorId=$supplier.id; formaPagamento='Boleto'; dataVencimento=$due; contaFinanceiraId=$bank.id; itens=@(@{produtoId=$coffee.id; quantidade=5; precoUnitario=14.5}) }
  $after = (Call Get 'produtos' | Where-Object id -eq $coffee.id).quantidade
  $ledger = Call Get 'lancamentos' | Where-Object id -eq $purchase.lancamento_financeiro_id
  if ($after -ne ($before + 5) -or $ledger.tipo -ne 'Saída' -or $ledger.status -ine 'Pendente') { throw "Compra não refletiu no estoque e nas contas a pagar: antes= depois= tipo= status=" }
}
if (!@(Call Get 'estoque/movimentos' | Where-Object motivo -eq 'Demo: contagem física de café').Count) {
  $null = Call Post 'estoque/conferencia' @{ produtoId=$coffee.id; quantidade=7; modo='Conferência'; motivo='Demo: contagem física de café' }
}
foreach ($goal in @(@{tipo='Vendas';valor_meta=150;mes_referencia=$month.ToString('yyyy-MM-dd')}, @{tipo='Despesas';valor_meta=3100;mes_referencia=$month.ToString('yyyy-MM-dd')})) {
  if (!@(Call Get 'metas' | Where-Object { $_.tipo -eq $goal.tipo -and $_.mes_referencia -eq $goal.mes_referencia }).Count) { $null = Call Post 'metas' $goal }
}
$plan = Call Get 'planejamento'
if ($plan.projecoes.Count -ne 3 -or $plan.saldoContas -le 0 -or $plan.alertasEstoque.Count -lt 1) { throw 'Indicadores de demonstração incoerentes.' }
Write-Output "Demonstração carregada. Usuário $email. Previsão: $($plan.projecoes.Count) meses."
