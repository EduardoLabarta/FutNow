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

  if (loading) return <div className="loading-state">Cargando...</div>;
  if (session) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const { error } = await authService.signIn(email, password);
    if (error) setErrorMsg('Credenciales inválidas, intenta de nuevo.');
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ borderTop: '4px solid var(--primary)' }}>
        <div className="flex-center mb-2" style={{ gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', backgroundColor: 'var(--primary)', borderRadius: '6px' }}></div>
          <h1 style={{ margin: 0, fontSize: '28px' }}>FutNow</h1>
        </div>
        <h2 className="text-muted font-semibold text-center mb-6" style={{ fontSize: '15px' }}>Acceso a tu cuenta deportiva</h2>
        
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
          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '12px' }}>
             Iniciar Sesión
          </button>
        </form>
        
        <div style={{ display: 'flex', alignItems: 'center', margin: '32px 0' }}>
          <div style={{ flex: 1, borderTop: '1px solid var(--border-color)' }}></div>
          <span style={{ padding: '0 12px', color: 'var(--text-muted)', fontSize: '13px' }}>¿No tienes cuenta?</span>
          <div style={{ flex: 1, borderTop: '1px solid var(--border-color)' }}></div>
        </div>
        
        <button type="button" onClick={() => navigate('/register')} className="btn btn-secondary btn-block">
          Crear una cuenta nueva
        </button>
      </div>
    </div>
  );
}
