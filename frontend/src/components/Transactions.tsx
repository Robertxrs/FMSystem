import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Table, Badge, Alert, Modal, ButtonGroup } from 'react-bootstrap';
import apiClient from '../api';

interface Transaction {
    id: number;
    date: string;
    description: string;
    category: string;
    amount: number;
    type: 'income' | 'expense';
}

const Transactions = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [formData, setFormData] = useState({
        description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0], type: 'expense'
    });
    const [message, setMessage] = useState<{type: 'success' | 'danger', text: string} | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    type FormElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const handleInputChange = (e: React.ChangeEvent<FormElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const fetchTransactions = async () => {
        try {
            const response = await apiClient.get('/transactions');
            setTransactions(response.data);
        } catch (error) {
            console.error("Erro ao buscar transações:", error);
            setMessage({type: 'danger', text: 'Não foi possível carregar as transações.'});
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isIncome = formData.category === 'Receita';
        const transactionType = isIncome ? 'income' : 'expense';
        const transactionAmount = isIncome ? Math.abs(parseFloat(formData.amount)) : -Math.abs(parseFloat(formData.amount));
        const newTransaction = {
            description: formData.description, amount: transactionAmount, date: formData.date, category: formData.category, type: transactionType,
        };
        try {
            await apiClient.post('/transactions', newTransaction);
            setMessage({type: 'success', text: 'Transação adicionada com sucesso!'});
            fetchTransactions();
            setFormData({ description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0], type: 'expense' });
        } catch (error) {
            console.error("Erro ao adicionar transação:", error);
            setMessage({type: 'danger', text: 'Erro ao adicionar transação.'});
        }
    };
    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
            try {
                await apiClient.delete(`/transactions/${id}`);
                setMessage({type: 'success', text: 'Transação excluída com sucesso!'});
                fetchTransactions();
            } catch (error) {
                console.error("Erro ao excluir transação:", error);
                setMessage({type: 'danger', text: 'Erro ao excluir transação.'});
            }
        }
    };
    const handleShowEditModal = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setShowEditModal(true);
    };

    const handleEditChange = (e: React.ChangeEvent<FormElement>) => {
        if (editingTransaction) {
            setEditingTransaction({ ...editingTransaction, [e.target.id]: e.target.value });
        }
    };

    const handleUpdate = async () => {
        if (!editingTransaction) return;
        try {
            const { id, ...updateData } = editingTransaction;
            await apiClient.put(`/transactions/${id}`, updateData);
            setMessage({type: 'success', text: 'Transação atualizada com sucesso!'});
            fetchTransactions();
            setShowEditModal(false);
            setEditingTransaction(null);
        } catch (error) {
            console.error("Erro ao atualizar transação:", error);
            setMessage({type: 'danger', text: 'Erro ao atualizar transação.'});
        }
    };

    return (
        <div className="p-4 p-lg-5">
            <h2 className="fs-2 fw-bold mb-4">Transações</h2>
            {message && <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>{message.text}</Alert>}

            <Row>
                <Col lg={4} className="mb-4 mb-lg-0">
                    <Card className="shadow-sm border-0 rounded-3">
                        <Card.Body className="p-4">
                            <Card.Title as="h3" className="fs-5 fw-bold mb-3">Adicionar Nova Transação</Card.Title>
                            <Form onSubmit={handleSubmit}>
                                {}
                                <Form.Group className="mb-3"><Form.Label>Descrição</Form.Label><Form.Control id="description" type="text" value={formData.description} onChange={handleInputChange} placeholder="Ex: Salário" required /></Form.Group>
                                <Form.Group className="mb-3"><Form.Label>Valor</Form.Label><Form.Control id="amount" type="number" step="0.01" value={formData.amount} onChange={handleInputChange} placeholder="0,00" required /></Form.Group>
                                <Form.Group className="mb-3"><Form.Label>Categoria</Form.Label><Form.Select id="category" value={formData.category} onChange={handleInputChange} required><option value="">Selecione...</option><option value="Receita">Receita</option><option value="Moradia">Moradia</option><option value="Alimentação">Alimentação</option><option value="Transporte">Transporte</option><option value="Lazer">Lazer</option><option value="Saúde">Saúde</option><option value="Outros">Outros</option></Form.Select></Form.Group>
                                <Form.Group className="mb-3"><Form.Label>Data</Form.Label><Form.Control id="date" type="date" value={formData.date} onChange={handleInputChange} required /></Form.Group>
                                <div className="d-grid"><Button variant="primary" type="submit">Adicionar</Button></div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={8}>
                    <Card className="shadow-sm border-0 rounded-3">
                        <Card.Body>
                            <Card.Title as="h3" className="fs-5 fw-bold mb-3">Últimas Transações</Card.Title>
                            <Table striped responsive hover>
                                <thead>
                                    <tr>
                                        <th>Data</th><th>Descrição</th><th>Categoria</th><th className="text-end">Valor</th><th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(t => (
                                        <tr key={t.id}>
                                            <td>{new Date(t.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                            <td>{t.description}</td>
                                            <td><Badge bg={t.type === 'income' ? 'success' : 'secondary'}>{t.category}</Badge></td>
                                            <td className={`text-end fw-bold ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>{t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                            <td>
                                                <ButtonGroup size="sm">
                                                    <Button variant="outline-primary" onClick={() => handleShowEditModal(t)}>Editar</Button>
                                                    <Button variant="outline-danger" onClick={() => handleDelete(t.id)}>Excluir</Button>
                                                </ButtonGroup>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Transação</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editingTransaction && (
                        <Form>
                            <Form.Group className="mb-3"><Form.Label>Descrição</Form.Label><Form.Control id="description" type="text" value={editingTransaction.description} onChange={handleEditChange} required /></Form.Group>
                            <Form.Group className="mb-3"><Form.Label>Valor</Form.Label><Form.Control id="amount" type="number" step="0.01" value={editingTransaction.amount} onChange={handleEditChange} required /></Form.Group>
                            <Form.Group className="mb-3"><Form.Label>Categoria</Form.Label><Form.Select id="category" value={editingTransaction.category} onChange={handleEditChange} required><option value="Receita">Receita</option><option value="Moradia">Moradia</option><option value="Alimentação">Alimentação</option><option value="Transporte">Transporte</option><option value="Lazer">Lazer</option><option value="Saúde">Saúde</option><option value="Outros">Outros</option></Form.Select></Form.Group>
                            <Form.Group className="mb-3"><Form.Label>Data</Form.Label><Form.Control id="date" type="date" value={editingTransaction.date} onChange={handleEditChange} required /></Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={handleUpdate}>Salvar Alterações</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Transactions;
