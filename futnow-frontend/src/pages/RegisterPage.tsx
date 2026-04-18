import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

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

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ borderTop: '4px solid var(--primary)' }}>
        <div className="flex-center mb-2" style={{ gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', backgroundColor: 'var(--primary)', borderRadius: '6px' }}></div>
          <h1 style={{ margin: 0, fontSize: '28px' }}>FutNow</h1>
        </div>
        <h2 className="text-muted font-semibold text-center mb-6" style={{ fontSize: '15px' }}>Crear una cuenta oficial</h2>
        
        {message && (
           <div className={`alert ${isSuccess ? 'alert-success' : 'alert-danger'}`}>
              {message}
           </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre Público</label>
            <input className="form-control" type="text" placeholder="Ej: El Mago" required value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Correo Electrónico</label>
            <input className="form-control" type="email" placeholder="jugador@ejemplo.com" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input className="form-control" type="password" placeholder="Mínimo 6 caracteres" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '12px' }}>
             Completar Registro
          </button>
        </form>
        
        <div style={{ display: 'flex', alignItems: 'center', margin: '32px 0' }}>
          <div style={{ flex: 1, borderTop: '1px solid var(--border-color)' }}></div>
          <span style={{ padding: '0 12px', color: 'var(--text-muted)', fontSize: '13px' }}>¿Ya tienes cuenta?</span>
          <div style={{ flex: 1, borderTop: '1px solid var(--border-color)' }}></div>
        </div>
        
        <button type="button" onClick={() => navigate('/login')} className="btn btn-secondary btn-block">
           Volver a Iniciar Sesión
        </button>
      </div>
    </div>
  );
}
