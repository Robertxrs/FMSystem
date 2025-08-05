import React from 'react';
import { Row, Col, Card, Button, Form, ProgressBar, Badge } from 'react-bootstrap';


const sampleBudgets = [
    { category: 'Alimentação', limit: 800.00, spent: 620.45 },
    { category: 'Transporte', limit: 300.00, spent: 150.00 },
    { category: 'Lazer', limit: 400.00, spent: 350.00 },
    { category: 'Saúde', limit: 500.00, spent: 180.00 },
];

const BudgetCard = ({ category, limit, spent }: { category: string, limit: number, spent: number }) => {
    const percentage = Math.round((spent / limit) * 100);
    const variant = percentage > 90 ? 'danger' : percentage > 70 ? 'warning' : 'success';
    const remaining = limit - spent;

    return (
        <Card className="shadow-sm border-0 rounded-3 h-100">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <Card.Title as="h3" className="fs-6 fw-bold mb-0">{category}</Card.Title>
                    <Badge pill bg={variant}>{percentage}%</Badge>
                </div>
                <ProgressBar now={percentage} variant={variant} className="mb-2" />
                <div className="d-flex justify-content-between text-muted small">
                    <span>Gasto: {spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    <span>Restante: {remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                 <div className="text-center text-muted small mt-1">
                    Limite: {limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
            </Card.Body>
        </Card>
    );
};

const Budgets = () => {
    return (
        <div className="p-4 p-lg-5">
            <h2 className="fs-2 fw-bold mb-4">Orçamentos Mensais</h2>
            
            <Row className="mb-4">
                <Col>
                    <Card className="shadow-sm border-0 rounded-3">
                        <Card.Body>
                            <Card.Title as="h3" className="fs-5 fw-bold mb-3">Criar Novo Orçamento</Card.Title>
                            <Form as={Row} className="g-3 align-items-end">
                                <Col md={5}>
                                    <Form.Group controlId="budgetCategory">
                                        <Form.Label>Categoria</Form.Label>
                                        <Form.Select>
                                            <option>Selecione...</option>
                                            <option value="moradia">Moradia</option>
                                            <option value="alimentacao">Alimentação</option>
                                            <option value="transporte">Transporte</option>
                                            <option value="lazer">Lazer</option>
                                            <option value="saude">Saúde</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={5}>
                                    <Form.Group controlId="budgetLimit">
                                        <Form.Label>Limite Mensal</Form.Label>
                                        <Form.Control type="number" placeholder="R$ 0,00" />
                                    </Form.Group>
                                </Col>
                                <Col md={2} className="d-grid">
                                    <Button variant="primary">Criar</Button>
                                </Col>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row xs={1} md={2} lg={3} className="g-4">
                {sampleBudgets.map(budget => (
                    <Col key={budget.category}>
                        <BudgetCard {...budget} />
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default Budgets;
