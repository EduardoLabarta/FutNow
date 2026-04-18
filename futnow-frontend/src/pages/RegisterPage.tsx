import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import logo from '../assets/logo.png';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (loading) return <div className="loading-state">Cargando...</div>;
  if (session) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    const { error } = await authService.signUp(email, password, name);
    if (error) {
      setIsSuccess(false);
      setMessage(`Fallo de Base de Datos: ${error.message}`);
    } else {
      setIsSuccess(true);
      setMessage('¡Expediente creado correctamente! Comprueba tu email o haz login directo según las políticas actuales de Supabase.');
    }
  };

  const handleGoogleLogin = async () => {
    setMessage('');
    const { error } = await authService.signInWithGoogle();
    if (error) {
      setIsSuccess(false);
      setMessage(`Error al conectar con Google: ${error.message}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="flex-center mb-6">
          <img src={logo} alt="FutNow" style={{ width: '180px', height: 'auto' }} />
        </div>
        
        <h2 className="text-muted text-center mb-6" style={{ fontSize: '16px', fontWeight: 500 }}>Crea tu cuenta de deportista</h2>
        
        {message && (
           <div className={`alert ${isSuccess ? 'alert-success' : 'alert-danger'}`}>
              {message}
           </div>
        )}

        <form onSubmit={handleSubmit} className="flex-column gap-4">
          <div className="form-group">
            <label>Nombre Público</label>
            <input 
              className="form-control" 
              type="text" 
              placeholder="Ej: El Mago" 
              required 
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>
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
              placeholder="Mínimo 6 caracteres" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block mt-2">
             Completar Registro
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
          <span style={{ color: 'var(--text-light)', fontSize: '13px' }}>¿Ya tienes cuenta?</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
        </div>
        
        <button type="button" onClick={() => navigate('/login')} className="btn btn-secondary btn-block">
           Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
}
