import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto'; // <-- IMPORTAÇÃO CORRIGIDA

// Tipagem para as props do ChartContainer
interface ChartContainerProps {
  chartId: string;
  title: string;
  description: string;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ chartId, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm">
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-slate-500 text-sm mb-4">{description}</p>
    <div className="relative h-80">
      <canvas id={chartId}></canvas>
    </div>
  </div>
);

// Tipagem para as props do Dashboard
interface DashboardProps {
  toggleSidebar: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ toggleSidebar }) => {
  const expensesChartRef = useRef<Chart | null>(null);
  const incomeExpenseChartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const expensesData = {
        labels: ['Moradia', 'Transporte', 'Alimentação', 'Lazer', 'Saúde', 'Outros'],
        datasets: [{
            data: [1850.50, 760.00, 1230.80, 450.00, 300.00, 299.00],
            backgroundColor: ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#64748b'],
            hoverOffset: 4
        }]
    };
    const incomeExpenseData = {
        labels: ['Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
        datasets: [
            { label: 'Receitas', data: [6500, 6800, 7200, 7100, 7400, 7500], backgroundColor: '#22c55e', borderRadius: 6 },
            { label: 'Despesas', data: [4200, 4500, 4100, 5200, 4750, 4890.30], backgroundColor: '#ef4444', borderRadius: 6 }
        ]
    };

    if (expensesChartRef.current) expensesChartRef.current.destroy();
    if (incomeExpenseChartRef.current) incomeExpenseChartRef.current.destroy();

    const expensesCanvas = document.getElementById('expensesChart') as HTMLCanvasElement;
    if (expensesCanvas) {
        const expensesCtx = expensesCanvas.getContext('2d');
        if (expensesCtx) {
            expensesChartRef.current = new Chart(expensesCtx, {
                type: 'doughnut',
                data: expensesData,
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
            });
        }
    }

    const incomeExpenseCanvas = document.getElementById('incomeExpenseChart') as HTMLCanvasElement;
    if (incomeExpenseCanvas) {
        const incomeExpenseCtx = incomeExpenseCanvas.getContext('2d');
        if(incomeExpenseCtx) {
            incomeExpenseChartRef.current = new Chart(incomeExpenseCtx, {
                type: 'bar',
                data: incomeExpenseData,
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
            });
        }
    }

    return () => {
        if (expensesChartRef.current) expensesChartRef.current.destroy();
        if (incomeExpenseChartRef.current) incomeExpenseChartRef.current.destroy();
    };
  }, []);

  return (
    <div className="p-4 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-slate-500">Seu resumo financeiro.</p>
        </div>
        <button type="button" onClick={toggleSidebar} className="lg:hidden p-2 rounded-md bg-white shadow" aria-label='botão'>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm"><h3 className="text-slate-500 font-medium">Saldo Total</h3><p className="text-3xl font-bold text-blue-600 mt-2">R$ 12.450,75</p></div>
        <div className="bg-white p-6 rounded-xl shadow-sm"><h3 className="text-slate-500 font-medium">Receitas do Mês</h3><p className="text-3xl font-bold text-green-500 mt-2">R$ 7.500,00</p></div>
        <div className="bg-white p-6 rounded-xl shadow-sm"><h3 className="text-slate-500 font-medium">Despesas do Mês</h3><p className="text-3xl font-bold text-red-500 mt-2">R$ 4.890,30</p></div>
        <div className="bg-white p-6 rounded-xl shadow-sm"><h3 className="text-slate-500 font-medium">Economia do Mês</h3><p className="text-3xl font-bold text-slate-600 mt-2">R$ 2.609,70</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartContainer chartId="expensesChart" title="Despesas por Categoria" description="Distribuição de despesas do mês atual." />
        <ChartContainer chartId="incomeExpenseChart" title="Receitas vs. Despesas" description="Comparativo dos últimos seis meses." />
      </div>
    </div>
  );
};

export default Dashboard;
