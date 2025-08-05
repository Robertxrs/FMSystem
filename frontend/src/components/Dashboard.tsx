import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Row, Card } from 'react-bootstrap';
import { Chart } from 'chart.js/auto';
import apiClient from '../api';

interface DashboardProps {
    toggleSidebar: () => void;
}

interface DashboardStats {
    saldoTotal: number;
    receitasMes: number;
    despesasMes: number;
    economiaMes: number;
}

interface ReportData {
    labels: string[];
    data: number[];
}

const StatCard = ({ title, value, textColor }: { title: string, value: number, textColor: string }) => (
    <Card className="shadow-sm border-0 rounded-3 h-100">
        <Card.Body>
            <Card.Title className="text-muted fw-medium">{title}</Card.Title>
            <p className={`fs-2 fw-bold ${textColor}`}>
                {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
        </Card.Body>
    </Card>
);

const Dashboard: React.FC<DashboardProps> = ({ toggleSidebar }) => {
    const expensesChartRef = useRef<Chart | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [reportData, setReportData] = useState<ReportData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsResponse = await apiClient.get('/stats');
                setStats(statsResponse.data);

                const currentMonth = new Date().toISOString().slice(0, 7);
                const reportResponse = await apiClient.get('/reports', { params: { month: currentMonth } });
                setReportData(reportResponse.data);

            } catch (error) {
                console.error('Erro ao carregar dados do dashboard:', error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (reportData && reportData.labels.length > 0) {
            const canvas = document.getElementById('expensesChart') as HTMLCanvasElement;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    if (expensesChartRef.current) {
                        expensesChartRef.current.destroy();
                    }
                    expensesChartRef.current = new Chart(ctx, {
                        type: 'doughnut',
                        data: {
                            labels: reportData.labels,
                            datasets: [{
                                data: reportData.data,
                                backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#6f42c1', '#dc3545', '#6c757d'],
                                hoverOffset: 4
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'bottom' } }
                        }
                    });
                }
            }
        }
    }, [reportData]); 

    return (
        <div className="p-4 p-lg-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fs-2 fw-bold">Dashboard</h2>
                    <p className="text-muted">Seu resumo financeiro.</p>
                </div>
                <Button variant="light" className="d-lg-none" onClick={toggleSidebar}>Menu</Button>
            </div>

            {stats ? (
                <Row xs={1} md={2} lg={4} className="g-4 mb-4">
                    <Col><StatCard title="Saldo Total" value={stats.saldoTotal} textColor="text-primary" /></Col>
                    <Col><StatCard title="Receitas do Mês" value={stats.receitasMes} textColor="text-success" /></Col>
                    <Col><StatCard title="Despesas do Mês" value={stats.despesasMes} textColor="text-danger" /></Col>
                    <Col><StatCard title="Economia do Mês" value={stats.economiaMes} textColor="text-dark" /></Col>
                </Row>
            ) : (
                <p>A carregar dados...</p>
            )}

            <Row>
                <Col>
                    <Card className="shadow-sm border-0 rounded-3">
                        <Card.Body>
                            <Card.Title as="h3" className="fs-5 fw-bold">Despesas por Categoria (Mês Atual)</Card.Title>
                            <div style={{ position: 'relative', height: '320px' }}>
                                <canvas id="expensesChart"></canvas>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;