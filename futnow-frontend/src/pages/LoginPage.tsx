import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando...</div>;
  if (session) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const { error } = await authService.signIn(email, password);
    if (error) setErrorMsg('Credenciales inválidas, intenta de nuevo.');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '30px', margin: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>⚽ FutNow</h1>
        <h2 style={{ textAlign: 'center', color: 'var(--secondary)', marginBottom: '30px', fontWeight: 'normal', fontSize: '18px' }}>Control de Acceso</h2>
        
        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input className="form-control" type="email" placeholder="jugador@ejemplo.com" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input className="form-control" type="password" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px', padding: '12px' }}>
             Iniciar Sesión
          </button>
        </form>
        
        <hr style={{ margin: '25px 0', borderTop: '1px solid var(--border-color)' }} />
        
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--secondary)' }}>¿No cuentas con autorización?</p>
          <button type="button" onClick={() => navigate('/register')} className="btn btn-secondary" style={{ width: '100%' }}>
             Solicitar Ingreso (Registro)
          </button>
        </div>
      </div>
    </div>
  );
}
