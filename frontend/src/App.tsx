import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Reports from './components/Reports';
import Budgets from './components/Budgets';

function AppContent() {
  const [showSidebar, setShowSidebar] = useState(false);
  const location = useLocation();

  return (
    <Container fluid className="p-0 h-100">
      <Row className="g-0 h-100">
        <Col 
          as="aside" 
          xs={8} md={3} lg={2} 
          className="d-none d-lg-block bg-white shadow-sm"
          style={{ height: '100vh', position: 'sticky', top: 0 }}
        >
          <Sidebar currentPath={location.pathname} />
        </Col>
        
        <Col as="main" md={9} lg={10} style={{ overflowY: 'auto', height: '100vh' }}>
          {}
          <Routes>
            <Route path="/" element={<Dashboard toggleSidebar={() => setShowSidebar(true)} />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/budgets" element={<Budgets />} />
          </Routes>
        </Col>
      </Row>

      <Sidebar.Offcanvas 
        show={showSidebar} 
        handleClose={() => setShowSidebar(false)} 
        currentPath={location.pathname}
      />
    </Container>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;