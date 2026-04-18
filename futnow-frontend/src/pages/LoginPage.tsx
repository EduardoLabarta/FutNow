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

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    const { error } = await authService.signInWithGoogle();
    if (error) setErrorMsg(`Error al conectar con Google: ${error.message}`);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="flex-center mb-6" style={{ gap: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '32px', letterSpacing: '-0.05em' }}>FutNow</h1>
        </div>
        
        <h2 className="text-muted text-center mb-6" style={{ fontSize: '16px', fontWeight: 500 }}>Inicia sesión en tu cuenta deportiva</h2>
        
        {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="flex-column gap-4">
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input 
              className="form-control" 
              type="email" 
              placeholder="tu@email.com" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input 
              className="form-control" 
              type="password" 
              placeholder="••••••••" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block mt-2">
             Entrar al Sistema
          </button>

          <button 
            type="button" 
            onClick={handleGoogleLogin} 
            className="btn btn-secondary btn-block flex-center" 
            style={{ gap: '10px', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db' }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px', height: '18px' }} />
            Continuar con Google
          </button>
        </form>
        
        <div className="flex-center" style={{ margin: '32px 0', gap: '12px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
          <span style={{ color: 'var(--text-light)', fontSize: '13px' }}>¿Eres nuevo?</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
        </div>
        
        <button type="button" onClick={() => navigate('/register')} className="btn btn-secondary btn-block">
          Crear cuenta oficial
        </button>
      </div>
    </div>
  );
}
