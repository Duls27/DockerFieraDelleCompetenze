import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home, { Landing } from './pages/Home';   // Landing esportato da Home.jsx
import VotaOspiti from './pages/VotaOspiti';
import VotaCapi from './pages/VotaCapi';
import StandView from './pages/StandView';
import Registrazione from './pages/Registrazione';
import HowToUse from './pages/HowToUse';

import AdminLogin from './pages/AdminLogin';
import Admin from './pages/Admin';          // dashboard protetta
import ProtectedRoute from './ProtectedRoute';

const App = () => (
  <Router>
    <Routes>
      {/* ───────────────────────── Sezione pubblica con sidebar ───────────────────────── */}
      <Route path="/" element={<Home />}>
        {/* pagina principale (logo + titolo, ecc.) */}
        <Route index element={<Landing />} />

        {/* rotte figlie che ereditano la sidebar */}
        <Route path="vota/ospiti"   element={<VotaOspiti />} />
        <Route path="vota/capi"     element={<VotaCapi />} />
        <Route path="lista/stand"   element={<StandView />} />
        <Route path="registrazione" element={<Registrazione />} />
        <Route path="come-funziona" element={<HowToUse />} />
      </Route>

      {/* ───────────────────────── Rotte senza sidebar ───────────────────────── */}
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />
    </Routes>
  </Router>
);

export default App;
