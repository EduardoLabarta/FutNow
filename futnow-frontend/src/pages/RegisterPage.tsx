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

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando...</div>;
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '30px', margin: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>⚽ FutNow</h1>
        <h2 style={{ textAlign: 'center', color: 'var(--secondary)', marginBottom: '30px', fontWeight: 'normal', fontSize: '18px' }}>Solicitud de Alta</h2>
        
        {message && (
           <div className={`alert ${isSuccess ? 'alert-success' : 'alert-danger'}`}>
              {message}
           </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>A.K.A. o Nombre Público</label>
            <input className="form-control" type="text" placeholder="Ej: El Mago" required value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Correo Electrónico Base</label>
            <input className="form-control" type="email" placeholder="jugador@ejemplo.com" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Contraseña Maestra</label>
            <input className="form-control" type="password" placeholder="Mínimo 6 caracteres" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-success" style={{ width: '100%', marginTop: '10px', padding: '12px' }}>
             Completar Registro
          </button>
        </form>
        
        <hr style={{ margin: '25px 0', borderTop: '1px solid var(--border-color)' }} />
        
        <div style={{ textAlign: 'center' }}>
          <button type="button" onClick={() => navigate('/login')} className="btn btn-secondary" style={{ width: '100%' }}>
             Volver a Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
