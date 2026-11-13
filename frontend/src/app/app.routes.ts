import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'Dashboard geral · FluxCore',
    data: { view: 'Dashboard' },
    loadComponent: () => import('./features/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'vendas',
    title: 'Vendas · FluxCore',
    data: { view: 'Vendas' },
    loadComponent: () => import('./features/vendas/vendas.page').then((m) => m.VendasPage),
  },
  {
    path: 'compras',
    title: 'Compras · FluxCore',
    data: { view: 'Compras' },
    loadComponent: () => import('./features/compras/compras.page').then((m) => m.ComprasPage),
  },
  {
    path: 'estoque',
    title: 'Estoque · FluxCore',
    data: { view: 'Estoque' },
    loadComponent: () => import('./features/estoque/estoque.page').then((m) => m.EstoquePage),
  },
  {
    path: 'financeiro',
    title: 'Financeiro · FluxCore',
    data: { view: 'Financeiro' },
    loadComponent: () =>
      import('./features/financeiro/financeiro.page').then((m) => m.FinanceiroPage),
  },
  {
    path: 'clientes',
    title: 'Clientes · FluxCore',
    data: { view: 'Clientes' },
    loadComponent: () => import('./features/clientes/clientes.page').then((m) => m.ClientesPage),
  },
  { path: '**', redirectTo: 'dashboard' },
];
