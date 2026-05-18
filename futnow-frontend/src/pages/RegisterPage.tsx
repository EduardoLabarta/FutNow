import { useState, type FormEvent } from 'react';
import { LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { authService } from '../services/authService';
import { Button } from '../components/ui';
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');

    const { error } = await authService.signUp(email, password, name);
    if (error) {
      setIsSuccess(false);
      setMessage(`Fallo de base de datos: ${error.message}`);
    } else {
      setIsSuccess(true);
      setMessage('Cuenta creada correctamente. Revisa tu email o inicia sesión según la configuración actual.');
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
      <aside className="auth-visual" aria-hidden="true">
        <div className="auth-visual-card">
          <span className="eyebrow">Nueva convocatoria</span>
          <h1>Tu grupo de juego empieza con una cuenta.</h1>
          <p>Crea tu perfil, define tu posición y empieza a sumarte a partidos cerca de ti.</p>
        </div>
      </aside>

      <main className="auth-panel">
        <section className="auth-card" aria-labelledby="register-title">
          <img src={logo} alt="FutNow" className="auth-logo" />
          <h1 id="register-title" className="sr-only">Crear cuenta en FutNow</h1>
          <p className="auth-subtitle">Crea tu cuenta y empieza a jugar.</p>

          {message && (
            <div className={`alert ${isSuccess ? 'alert-success' : 'alert-danger'}`} role="alert">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex-column gap-4">
            <div className="form-group mb-0">
              <label htmlFor="register-name">Nombre público</label>
              <div className="info-row">
                <UserRound size={18} aria-hidden="true" />
                <input
                  id="register-name"
                  autoComplete="name"
                  className="form-control"
                  type="text"
                  placeholder="Ej: El Mago"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group mb-0">
              <label htmlFor="register-email">Correo electrónico</label>
              <div className="info-row">
                <Mail size={18} aria-hidden="true" />
                <input
                  id="register-email"
                  autoComplete="email"
                  className="form-control"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group mb-0">
              <label htmlFor="register-password">Contraseña</label>
              <div className="info-row">
                <LockKeyhole size={18} aria-hidden="true" />
                <input
                  id="register-password"
                  autoComplete="new-password"
                  className="form-control"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button fullWidth size="lg" type="submit">
              Crear cuenta
            </Button>

            <div className="auth-divider">
              <span>o</span>
            </div>

            <Button className="btn-google" fullWidth onClick={handleGoogleLogin} variant="secondary">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" width="18" height="18" />
              Continuar con Google
            </Button>
          </form>

          <p className="auth-footnote">
            ¿Ya tienes cuenta?{' '}
            <button className="auth-link" onClick={() => navigate('/login')} type="button">
              Inicia sesión
            </button>
          </p>
        </section>
      </main>
    </div>
  );
}
