import React from 'react';
import { Nav, Offcanvas } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface OffcanvasProps {
  show: boolean;
  handleClose: () => void;
  currentPath: string;
}

interface SidebarContentProps {
  currentPath: string;
}

const SidebarContent = ({ currentPath }: SidebarContentProps) => (
    <div className="p-3">
        <div className="d-flex align-items-center pb-3 mb-3 border-bottom">
            <div 
              className="bg-primary text-white d-flex align-items-center justify-content-center me-2" 
              style={{ width: '40px', height: '40px', borderRadius: '0.5rem' }}
            >
                {}
            </div>
            <span className="fs-5 fw-bold">Finanças</span>
        </div>
        <Nav variant="pills" className="flex-column" activeKey={currentPath}>
            <Nav.Link as={Link} to="/" eventKey="/">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/transactions" eventKey="/transactions">Transações</Nav.Link>
            <Nav.Link as={Link} to="/reports" eventKey="/reports">Relatórios</Nav.Link>
            <Nav.Link as={Link} to="/budgets" eventKey="/budgets">Orçamentos</Nav.Link>
        </Nav>
    </div>
);

const Sidebar = ({ currentPath }: { currentPath: string }) => <SidebarContent currentPath={currentPath} />;

Sidebar.Offcanvas = ({ show, handleClose, currentPath }: OffcanvasProps) => (
  <Offcanvas show={show} onHide={handleClose} responsive="lg">
    <Offcanvas.Header closeButton>
      <Offcanvas.Title>Menu</Offcanvas.Title>
    </Offcanvas.Header>
    <Offcanvas.Body className="p-0">
      <SidebarContent currentPath={currentPath} />
    </Offcanvas.Body>
  </Offcanvas>
);

export default Sidebar;
