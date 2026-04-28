import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import logo from '../assets/logo.png';

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
        <div className="flex-center" style={{ marginBottom: '32px' }}>
          <img src={logo} alt="FutNow" style={{ width: '300px', height: 'auto' }} />
        </div>
        
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '15px', fontWeight: 400, margin: '0 0 28px 0', lineHeight: 1.5 }}>
          Bienvenido de vuelta. Introduce tus credenciales para acceder.
        </p>
        
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
          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '8px', padding: '14px 24px', fontSize: '15px' }}>
            Iniciar Sesión
          </button>

          <div className="auth-divider">
            <span>o</span>
          </div>

          <button 
            type="button" 
            onClick={handleGoogleLogin} 
            className="btn btn-block flex-center btn-google" 
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px', height: '18px' }} />
            Continuar con Google
          </button>
        </form>
        
        <p style={{ textAlign: 'center', margin: '32px 0 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>
          ¿No tienes cuenta?{' '}
          <span 
            onClick={() => navigate('/register')} 
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
          >
            Regístrate
          </span>
        </p>
      </div>
    </div>
  );
}
