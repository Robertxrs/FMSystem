import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Reports from './components/Reports';
import Budgets from './components/Budgets';
import Goals from './components/Goals';

function AppContent() {
  const [showSidebar, setShowSidebar] = useState(false);
  const location = useLocation();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {}
      <div
        className="d-none d-lg-block bg-white shadow-sm"
        style={{ width: '250px', height: '100vh', position: 'sticky', top: 0 }}
      >
        <Sidebar currentPath={location.pathname} />
      </div>

      {}
      <main className="flex-grow-1" style={{ overflowY: 'auto', width: '100%' }}>
        <Routes>
          <Route
            path="/"
            element={<Dashboard toggleSidebar={() => setShowSidebar(true)} />}
          />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/goals" element={<Goals />} />
        </Routes>
      </main>

      {}
      <div className="d-lg-none">
        <Sidebar.Offcanvas
          show={showSidebar}
          handleClose={() => setShowSidebar(false)}
          currentPath={location.pathname}
        />
      </div>
    </div>
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
