import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, ProgressBar, Alert } from 'react-bootstrap';
import apiClient from '../api';

interface Goal {
  id: number;
  name: string;
  target_amount: number;
  saved_amount: number;
}

const GoalCard = ({
  id,
  name,
  target_amount,
  saved_amount,
  onDelete,
  onUpdate,
}: Goal & {
  onDelete: (id: number) => void;
  onUpdate: (goal: Goal) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name,
    target_amount: target_amount.toString(),
    saved_amount: saved_amount.toString(),
  });

  const percent = target_amount > 0
    ? Math.round((saved_amount / target_amount) * 100)
    : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onUpdate({
      id,
      name: editData.name,
      target_amount: parseFloat(editData.target_amount),
      saved_amount: parseFloat(editData.saved_amount),
    });
    setIsEditing(false);
  };

  return (
    <Card className="shadow-sm border-0 rounded-3 h-100">
      <Card.Body>
        {isEditing ? (
          <>
            <Form.Control
              name="name"
              value={editData.name}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Control
              name="target_amount"
              type="number"
              value={editData.target_amount}
              onChange={handleChange}
              className="mb-2"
            />
            <Form.Control
              name="saved_amount"
              type="number"
              value={editData.saved_amount}
              onChange={handleChange}
              className="mb-2"
            />
            <Button size="sm" onClick={handleSave} className="me-2">
              Salvar
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
          </>
        ) : (
          <>
            <Card.Title className="fs-6 fw-bold mb-2">{name}</Card.Title>
            <ProgressBar now={percent} label={`${percent}%`} className="mb-2" />
            <div className="d-flex justify-content-between text-muted small mb-2">
              <span>
                Guardado:{' '}
                {saved_amount.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
              <span>
                Meta:{' '}
                {target_amount.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <Button size="sm" variant="outline-primary" onClick={() => setIsEditing(true)}>
                Editar
              </Button>
              <Button size="sm" variant="outline-danger" onClick={() => onDelete(id)}>
                Excluir
              </Button>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [formData, setFormData] = useState({ name: '', target_amount: '' });
  const [message, setMessage] = useState<{
    type: 'success' | 'danger';
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data } = await apiClient.get<Goal[]>('/goals');
      setGoals(data);
    } catch (err) {
      console.error('Erro ao buscar metas:', err);
      setMessage({ type: 'danger', text: 'Falha ao carregar metas.' });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/goals', {
        name: formData.name,
        target_amount: parseFloat(formData.target_amount),
        saved_amount: 0,
      });
      setMessage({ type: 'success', text: 'Meta criada com sucesso!' });
      fetchGoals();
      setFormData({ name: '', target_amount: '' });
    } catch (err) {
      console.error('Erro ao criar meta:', err);
      setMessage({ type: 'danger', text: 'Erro ao criar meta.' });
    }
  };

  const handleDeleteGoal = async (id: number) => {
    try {
      await apiClient.delete(`/goals/${id}`);
      setMessage({ type: 'success', text: 'Meta excluída com sucesso!' });
      fetchGoals();
    } catch (err) {
      console.error('Erro ao excluir meta:', err);
      setMessage({ type: 'danger', text: 'Erro ao excluir meta.' });
    }
  };

  const handleUpdateGoal = async (updatedGoal: Goal) => {
    try {
      await apiClient.put(`/goals/${updatedGoal.id}`, updatedGoal);
      setMessage({ type: 'success', text: 'Meta atualizada com sucesso!' });
      fetchGoals();
    } catch (err) {
      console.error('Erro ao atualizar meta:', err);
      setMessage({ type: 'danger', text: 'Erro ao atualizar meta.' });
    }
  };

  return (
    <div className="p-4 p-lg-5">
      <h2 className="fs-2 fw-bold mb-4">Metas de Poupança</h2>
      {message && (
        <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
          {message.text}
        </Alert>
      )}

      <Card className="shadow-sm border-0 rounded-3 mb-4">
        <Card.Body>
          {}
          <Form onSubmit={handleSubmit}>
            <Row className="g-3 align-items-end">
              <Col md={6}>
                <Form.Group controlId="name">
                  <Form.Label>Nome da Meta</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Viagem de Férias"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="target_amount">
                  <Form.Label>Valor Alvo</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.target_amount}
                    onChange={handleInputChange}
                    placeholder="R$ 0,00"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={2} className="d-grid">
                <Button variant="primary" type="submit">
                  Criar Meta
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Row xs={1} md={2} lg={3} className="g-4">
        {goals.map((goal) => (
          <Col key={goal.id}>
            <GoalCard
              {...goal}
              onDelete={handleDeleteGoal}
              onUpdate={handleUpdateGoal}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Goals;
