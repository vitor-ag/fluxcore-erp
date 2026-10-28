import { Routes } from '@angular/router';
import { Dashboard } from './Pages/dashboard/dashboard';
import { Vendas } from './Pages/vendas/vendas';
import { Compras } from './Pages/compras/compras';
import { Estoque } from './Pages/estoque/estoque';
import { Clientes } from './Pages/clientes/clientes';
import { ContasPagar } from './Pages/contas-pagar/contas-pagar';
import { ContasReceber } from './Pages/contas-receber/contas-receber';
import { FluxoCaixa } from './Pages/fluxo-caixa/fluxo-caixa';
import { Resultado } from './Pages/resultado/resultado';

export const routes: Routes = [
    {
        path: "",
        component: Dashboard
    },
     {
        path: "vendas",
        component: Vendas
    },
     {
        path: "compras",
        component: Compras
    },
     {
        path: "estoque",
        component: Estoque
    },
    {
        path: "clientes",
        component: Clientes
    },
    {
        path: "contasPagar",
        component: ContasPagar
    },
    {
        path: "contasReceber",
        component: ContasReceber
    },
    {
        path: "fluxoCaixa",
        component: FluxoCaixa
    },
    {
        path: "resultado",
        component: Resultado
    }
];
