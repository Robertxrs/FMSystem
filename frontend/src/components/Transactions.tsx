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
    is_paid: boolean;
}

const Transactions = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [formData, setFormData] = useState({
        description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0], type: 'expense', is_paid: true
    });
    const [message, setMessage] = useState<{type: 'success' | 'danger', text: string} | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    type FormElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const handleInputChange = (e: React.ChangeEvent<FormElement>) => {
        const { id, value, type } = e.target;
        const inputValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [id]: inputValue }));
    };

    const fetchTransactions = async () => {
        try {
            const response = await apiClient.get('/transactions');
            setTransactions(response.data);
        } catch (error) {
            console.error(error);
            setMessage({type: 'danger', text: 'Erro ao atualizar transação.'});
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isIncome = formData.category === 'Receita';
        const newTransaction = {
            description: formData.description,
            amount: isIncome ? Math.abs(parseFloat(formData.amount)) : -Math.abs(parseFloat(formData.amount)),
            date: formData.date,
            category: formData.category,
            type: isIncome ? 'income' : 'expense',
            is_paid: formData.is_paid
        };
        try {
            await apiClient.post('/transactions', newTransaction);
            setMessage({type: 'success', text: 'Transação adicionada com sucesso!'});
            fetchTransactions();
            setFormData({ description: '', amount: '', category: '', date: new Date().toISOString().split('T')[0], type: 'expense', is_paid: true });
        } catch (error) {
            console.error(error);  // Isso imprime o erro no console
            setMessage({type: 'danger', text: 'Erro ao atualizar transação.'});
        }
    };
    
    // Nova função para atualizar o status de pago/recebido
    const handleStatusChange = async (transaction: Transaction) => {
        try {
            const updatedTransaction = { ...transaction, is_paid: !transaction.is_paid };
            await apiClient.put(`/transactions/${transaction.id}`, updatedTransaction);
            // Atualiza o estado localmente para uma resposta visual imediata
            setTransactions(prev => prev.map(t => t.id === transaction.id ? updatedTransaction : t));
        } catch (error) {
            console.error(error);  // Isso imprime o erro no console
            setMessage({type: 'danger', text: 'Erro ao atualizar transação.'});
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem a certeza que deseja excluir esta transação?')) {
            try {
                await apiClient.delete(`/transactions/${id}`);
                setMessage({type: 'success', text: 'Transação excluída com sucesso!'});
                fetchTransactions();
            } catch (error) {
                console.error(error);  // Isso imprime o erro no console
                setMessage({type: 'danger', text: 'Erro ao atualizar transação.'});
            }
        }
    };
    
    const handleShowEditModal = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setShowEditModal(true);
    };
    const handleEditChange = (e: React.ChangeEvent<FormElement>) => {
        if (editingTransaction) {
            const { id, value, type } = e.target;
            const inputValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
            setEditingTransaction({ ...editingTransaction, [id]: inputValue });
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
        }catch (error) {
            console.error(error);  // Isso imprime o erro no console
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
                                <Form.Group className="mb-3"><Form.Label>Descrição</Form.Label><Form.Control id="description" type="text" value={formData.description} onChange={handleInputChange} required /></Form.Group>
                                <Form.Group className="mb-3"><Form.Label>Valor</Form.Label><Form.Control id="amount" type="number" step="0.01" value={formData.amount} onChange={handleInputChange} required /></Form.Group>
                                <Form.Group className="mb-3"><Form.Label>Categoria</Form.Label><Form.Select id="category" value={formData.category} onChange={handleInputChange} required><option value="">Selecione...</option><option value="Receita">Receita</option><option value="Moradia">Moradia</option><option value="Alimentação">Alimentação</option><option value="Transporte">Transporte</option><option value="Lazer">Lazer</option><option value="Saúde">Saúde</option><option value="Outros">Outros</option></Form.Select></Form.Group>
                                <Form.Group className="mb-3"><Form.Label>Data</Form.Label><Form.Control id="date" type="date" value={formData.date} onChange={handleInputChange} required /></Form.Group>
                                <Form.Check type="switch" id="is_paid" label="Pago / Recebido" checked={formData.is_paid} onChange={handleInputChange} className="mb-3" />
                                <div className="d-grid"><Button variant="primary" type="submit">Adicionar</Button></div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={8}>
                    <Card className="shadow-sm border-0 rounded-3">
                        <Card.Body>
                            <Table striped responsive hover>
                                <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th>Data</th>
                                        <th>Descrição</th>
                                        <th className="text-end">Valor</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map(t => (
                                        <tr key={t.id} className={!t.is_paid ? 'text-muted' : ''}>
                                            <td>
                                                <Form.Check type="checkbox" checked={t.is_paid} onChange={() => handleStatusChange(t)} title={t.is_paid ? 'Marcar como não pago/recebido' : 'Marcar como pago/recebido'} />
                                            </td>
                                            <td>{new Date(t.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                            <td>{t.description} <Badge bg={t.type === 'income' ? 'success-subtle' : 'secondary-subtle'} text={t.type === 'income' ? 'success' : 'secondary'} className="ms-2">{t.category}</Badge></td>
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

            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton><Modal.Title>Editar Transação</Modal.Title></Modal.Header>
                <Modal.Body>
                    {editingTransaction && (
                        <Form>
                            <Form.Group className="mb-3"><Form.Label>Descrição</Form.Label><Form.Control id="description" type="text" value={editingTransaction.description} onChange={handleEditChange} required /></Form.Group>
                            <Form.Group className="mb-3"><Form.Label>Valor</Form.Label><Form.Control id="amount" type="number" step="0.01" value={editingTransaction.amount} onChange={handleEditChange} required /></Form.Group>
                            <Form.Group className="mb-3"><Form.Label>Categoria</Form.Label><Form.Select id="category" value={editingTransaction.category} onChange={handleEditChange} required><option value="Receita">Receita</option><option value="Moradia">Moradia</option><option value="Alimentação">Alimentação</option><option value="Transporte">Transporte</option><option value="Lazer">Lazer</option><option value="Saúde">Saúde</option><option value="Outros">Outros</option></Form.Select></Form.Group>
                            <Form.Group className="mb-3"><Form.Label>Data</Form.Label><Form.Control id="date" type="date" value={editingTransaction.date} onChange={handleEditChange} required /></Form.Group>
                            <Form.Check type="switch" id="is_paid" label="Pago / Recebido" checked={editingTransaction.is_paid} onChange={handleEditChange} />
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