import React, { useEffect, useRef } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import Chart from 'chart.js/auto';

const StatCard = ({ title, value, textColor }: { title: string, value: string, textColor: string }) => (
    <Card className="shadow-sm border-0 rounded-3 h-100">
        <Card.Body>
            <Card.Title className="text-muted fw-medium">{title}</Card.Title>
            <p className={`fs-2 fw-bold ${textColor}`}>{value}</p>
        </Card.Body>
    </Card>
);

const ChartCard = ({ chartId, title, description }: { chartId: string, title: string, description: string }) => (
    <Card className="shadow-sm border-0 rounded-3 p-2">
        <Card.Body>
            <Card.Title as="h3" className="fs-5 fw-bold">{title}</Card.Title>
            <Card.Text className="text-muted small">{description}</Card.Text>
            <div style={{ position: 'relative', height: '320px' }}>
                <canvas id={chartId}></canvas>
            </div>
        </Card.Body>
    </Card>
);

interface DashboardProps {
  toggleSidebar: () => void;
}
const Dashboard: React.FC<DashboardProps> = ({ toggleSidebar }) => {
  const expensesChartRef = useRef<Chart | null>(null);
  const incomeExpenseChartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const expensesData = {
        labels: ['Moradia', 'Transporte', 'Alimentação', 'Lazer', 'Saúde', 'Outros'],
        datasets: [{ data: [1850.50, 760.00, 1230.80, 450.00, 300.00, 299.00], backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#6f42c1', '#dc3545', '#6c757d'], hoverOffset: 4 }]
    };
    const incomeExpenseData = {
        labels: ['Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
        datasets: [ { label: 'Receitas', data: [6500, 6800, 7200, 7100, 7400, 7500], backgroundColor: 'rgba(25, 135, 84, 0.8)', borderRadius: 6 }, { label: 'Despesas', data: [4200, 4500, 4100, 5200, 4750, 4890.30], backgroundColor: 'rgba(220, 53, 69, 0.8)', borderRadius: 6 }]
    };
    if (expensesChartRef.current) expensesChartRef.current.destroy();
    if (incomeExpenseChartRef.current) incomeExpenseChartRef.current.destroy();
    const expensesCanvas = document.getElementById('expensesChart') as HTMLCanvasElement;
    if (expensesCanvas) { const expensesCtx = expensesCanvas.getContext('2d'); if (expensesCtx) { expensesChartRef.current = new Chart(expensesCtx, { type: 'doughnut', data: expensesData, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } } }); }}
    const incomeExpenseCanvas = document.getElementById('incomeExpenseChart') as HTMLCanvasElement;
    if (incomeExpenseCanvas) { const incomeExpenseCtx = incomeExpenseCanvas.getContext('2d'); if(incomeExpenseCtx) { incomeExpenseChartRef.current = new Chart(incomeExpenseCtx, { type: 'bar', data: incomeExpenseData, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } } }); }}
    return () => { if (expensesChartRef.current) expensesChartRef.current.destroy(); if (incomeExpenseChartRef.current) incomeExpenseChartRef.current.destroy(); };
  }, []);

  return (
    <div className="p-4 p-lg-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 className="fs-2 fw-bold">Dashboard</h2>
                <p className="text-muted">Seu resumo financeiro.</p>
            </div>
            <Button variant="light" className="d-lg-none" onClick={toggleSidebar}>
                Menu
            </Button>
        </div>

        <Row xs={1} md={2} lg={4} className="g-4 mb-4">
            <Col><StatCard title="Saldo Total" value="R$ 12.450,75" textColor="text-primary" /></Col>
            <Col><StatCard title="Receitas do Mês" value="R$ 7.500,00" textColor="text-success" /></Col>
            <Col><StatCard title="Despesas do Mês" value="R$ 4.890,30" textColor="text-danger" /></Col>
            <Col><StatCard title="Economia do Mês" value="R$ 2.609,70" textColor="text-dark" /></Col>
        </Row>

        <Row xs={1} lg={2} className="g-4">
            <Col><ChartCard chartId="expensesChart" title="Despesas por Categoria" description="Distribuição de despesas do mês atual." /></Col>
            <Col><ChartCard chartId="incomeExpenseChart" title="Receitas vs. Despesas" description="Comparativo dos últimos seis meses." /></Col>
        </Row>
    </div>
  );
};

export default Dashboard;