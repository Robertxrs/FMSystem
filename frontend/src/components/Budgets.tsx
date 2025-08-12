import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, ProgressBar, Badge, Alert, InputGroup } from 'react-bootstrap';
import apiClient from '../api';

interface Budget {
    id: number;
    category: string;
    limit: number;
    spent: number;
}

const BudgetCard = ({ id, category, limit, spent, onDelete, onUpdate }: Budget & { onDelete: (id: number) => void; onUpdate: (id: number, newLimit: number) => void; }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newLimit, setNewLimit] = useState(String(limit));
    
    const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    const variant = percentage > 90 ? 'danger' : percentage > 70 ? 'warning' : 'success';
    const remaining = limit - spent;

    const handleSave = () => {
        onUpdate(id, parseFloat(newLimit));
        setIsEditing(false);
    };

    return (
        <Card className="shadow-sm border-0 rounded-3 h-100">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <Card.Title as="h3" className="fs-6 fw-bold mb-0">{category}</Card.Title>
                    {!isEditing && <Badge pill bg={variant}>{percentage}%</Badge>}
                </div>
                
                {isEditing ? (
                    <div className="mb-2">
                        <Form.Label className="small">Novo Limite</Form.Label>
                        <InputGroup>
                            <InputGroup.Text>R$</InputGroup.Text>
                            <Form.Control type="number" value={newLimit} onChange={(e) => setNewLimit(e.target.value)} />
                        </InputGroup>
                    </div>
                ) : (
                    <>
                        <ProgressBar now={percentage} variant={variant} className="mb-2" />
                        <div className="d-flex justify-content-between text-muted small">
                            <span>Gasto: {spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                            <span>Restante: {remaining.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                        <div className="text-center text-muted small mt-1">
                            Limite: {limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                    </>
                )}

                <div className="d-flex justify-content-end gap-2 mt-3">
                    {isEditing ? (
                        <>
                            <Button size="sm" variant="success" onClick={handleSave}>Salvar</Button>
                            <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}>Cancelar</Button>
                        </>
                    ) : (
                        <>
                            <Button size="sm" variant="outline-primary" onClick={() => setIsEditing(true)}>Editar</Button>
                            <Button size="sm" variant="outline-danger" onClick={() => onDelete(id)}>Excluir</Button>
                        </>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
};

const Budgets = () => {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [formData, setFormData] = useState({ category: '', limit: '' });
    const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

    const fetchBudgets = async (month: string) => {
        try {
            const response = await apiClient.get('/budgets', { params: { month } });
            setBudgets(response.data);
        } catch{
            setMessage({ type: 'danger', text: 'Não foi possível carregar os orçamentos.' });
        }
    };

    useEffect(() => {
        fetchBudgets(selectedMonth);
    }, [selectedMonth]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, category: e.target.value }));
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, limit: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newBudget = {
                category: formData.category,
                limit: parseFloat(formData.limit),
                month: selectedMonth
            };
            await apiClient.post('/budgets', newBudget);
            setMessage({ type: 'success', text: 'Orçamento criado com sucesso!' });
            fetchBudgets(selectedMonth);
            setFormData({ category: '', limit: '' });
        } catch{
            setMessage({ type: 'danger', text: 'Erro ao criar orçamento.' });
        }
    };

    const handleDeleteBudget = async (id: number) => {
        if (window.confirm('Tem a certeza que deseja excluir este orçamento?')) {
            try {
                await apiClient.delete(`/budgets/${id}`);
                setMessage({ type: 'success', text: 'Orçamento excluído com sucesso!' });
                fetchBudgets(selectedMonth);
            } catch{
                setMessage({ type: 'danger', text: 'Erro ao excluir orçamento.' });
            }
        }
    };

    const handleUpdateBudget = async (id: number, newLimit: number) => {
        try {
            await apiClient.put(`/budgets/${id}`, { limit: newLimit });
            setMessage({ type: 'success', text: 'Orçamento atualizado com sucesso!' });
            fetchBudgets(selectedMonth);
        } catch{
            setMessage({ type: 'danger', text: 'Erro ao atualizar orçamento.' });
        }
    };

    return (
        <div className="p-4 p-lg-5">
            <h2 className="fs-2 fw-bold mb-4">Orçamentos Mensais</h2>
            {message && <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>{message.text}</Alert>}
            
            <Card className="shadow-sm border-0 rounded-3 mb-4">
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3 align-items-end">
                            <Col md={4}>
                                <Form.Group controlId="month">
                                    <Form.Label>Mês do Orçamento</Form.Label>
                                    <Form.Control type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group controlId="category">
                                    <Form.Label>Categoria</Form.Label>
                                    <Form.Select value={formData.category} onChange={handleCategoryChange} required>
                                        <option value="">Selecione...</option>
                                        <option value="Alimentação">Alimentação</option>
                                        <option value="Moradia">Moradia</option>
                                        <option value="Transporte">Transporte</option>
                                        <option value="Lazer">Lazer</option>
                                        <option value="Saúde">Saúde</option>
                                        <option value="Outros">Outros</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group controlId="limit">
                                    <Form.Label>Limite Mensal</Form.Label>
                                    <Form.Control type="number" value={formData.limit} onChange={handleLimitChange} placeholder="R$ 0,00" required />
                                </Form.Group>
                            </Col>
                            <Col md={2} className="d-grid">
                                <Button variant="primary" type="submit">Criar</Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>

            <Row xs={1} md={2} lg={3} className="g-4">
                {budgets.map(b => (
                    <Col key={b.id}>
                        <BudgetCard {...b} onDelete={handleDeleteBudget} onUpdate={handleUpdateBudget} />
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default Budgets;
