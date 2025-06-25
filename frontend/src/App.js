import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import VotaOspiti from './pages/VotaOspiti.jsx';
import VotaCapi from './pages/VotaCapi';
import StandView from './pages/StandView'; 
import Admin from './pages/Admin'; // dashboard protetta con sottopagine
import Registrazione from './pages/Registrazione';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './ProtectedRoute';
import HowToUse from './pages/HowToUse';


const App = () => {
  return (
    <Router>
      <Routes>
        {/* Pagina pubblica */}
        <Route path="/" element={<Home />} />
        <Route path="/vota/ospiti" element={<VotaOspiti />} />
        <Route path="/vota/capi" element={<VotaCapi />} />
        <Route path="/lista/stand" element={<StandView />} /> 
        <Route path="/registrazione" element={<Registrazione />} />
        <Route path="/come-funziona" element={<HowToUse />} />


        {/* Login admin (non protetta) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Rotta admin protetta, con tutte le sottopagine */}
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
};

export default App;
