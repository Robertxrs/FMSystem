import React, { useEffect, useRef, useState } from 'react';
import { Row, Col, Card, Button, Form } from 'react-bootstrap';
import Chart from 'chart.js/auto';
import apiClient from '../api';


interface ReportData {
    labels: string[];
    data: number[];
}

const Reports = () => {
    const reportChartRef = useRef<Chart | null>(null);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    const generateReport = async (month: string) => {
        try {
            const response = await apiClient.get('/reports', {
                params: { month: month }
            });
            setReportData(response.data);
        } catch (error) {
            console.error("Erro ao gerar relatório:", error);
            setReportData({ labels: [], data: [] });
        }
    };
    useEffect(() => {
        generateReport(selectedMonth);
    }, []);
    useEffect(() => {
        if (reportChartRef.current) {
            reportChartRef.current.destroy();
        }

        if (reportData) {
            const canvas = document.getElementById('reportChart') as HTMLCanvasElement;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    reportChartRef.current = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: reportData.labels,
                            datasets: [{
                                label: `Gastos de ${selectedMonth}`,
                                data: reportData.data,
                                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: { y: { beginAtZero: true } }
                        }
                    });
                }
            }
        }

        return () => {
            if (reportChartRef.current) {
                reportChartRef.current.destroy();
            }
        };
    }, [reportData]);

    const handleGenerateClick = () => {
        generateReport(selectedMonth);
    };

    return (
        <div className="p-4 p-lg-5">
            <h2 className="fs-2 fw-bold mb-4">Relatórios</h2>
            <Card className="shadow-sm border-0 rounded-3 mb-4">
                <Card.Body>
                    <Form as={Row} className="g-3 align-items-end">
                        <Col md={4}>
                            <Form.Group controlId="reportMonth">
                                <Form.Label>Mês</Form.Label>
                                <Form.Control 
                                    type="month" 
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md="auto">
                            <Button variant="primary" onClick={handleGenerateClick}>Gerar Relatório</Button>
                        </Col>
                    </Form>
                </Card.Body>
            </Card>

            <Card className="shadow-sm border-0 rounded-3">
                <Card.Body>
                    <Card.Title as="h3" className="fs-5 fw-bold mb-3">
                        {reportData ? `Resumo de Despesas para ${selectedMonth}` : 'Selecione um período'}
                    </Card.Title>
                    <div style={{ position: 'relative', height: '400px' }}>
                        <canvas id="reportChart"></canvas>
                    </div>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Reports;