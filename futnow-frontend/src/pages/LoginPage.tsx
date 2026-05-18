import { useState, type FormEvent } from 'react';
import { LockKeyhole, Mail } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { authService } from '../services/authService';
import { Button } from '../components/ui';
import logo from '../assets/logo.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (loading) return <div className="loading-state">Cargando...</div>;
  if (session) return <Navigate to="/" replace />;

  const handleSubmit = async (e: FormEvent) => {
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
      <aside className="auth-visual" aria-hidden="true">
        <div className="auth-visual-card">
          <span className="eyebrow">FutNow</span>
          <h1>Organiza el próximo partido sin ruido.</h1>
          <p>Encuentra jugadores, confirma plazas y mantén tus convocatorias bajo control desde una experiencia clara y rápida.</p>
        </div>
      </aside>

      <main className="auth-panel">
        <section className="auth-card" aria-labelledby="login-title">
          <img src={logo} alt="FutNow" className="auth-logo" />
          <h1 id="login-title" className="sr-only">Iniciar sesión en FutNow</h1>
          <p className="auth-subtitle">Bienvenido de vuelta. Entra para gestionar tus partidos.</p>

          {errorMsg && <div className="alert alert-danger" role="alert">{errorMsg}</div>}

          <form onSubmit={handleSubmit} className="flex-column gap-4">
            <div className="form-group mb-0">
              <label htmlFor="login-email">Correo electrónico</label>
              <div className="info-row">
                <Mail size={18} aria-hidden="true" />
                <input
                  id="login-email"
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
              <label htmlFor="login-password">Contraseña</label>
              <div className="info-row">
                <LockKeyhole size={18} aria-hidden="true" />
                <input
                  id="login-password"
                  autoComplete="current-password"
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
              Iniciar sesión
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
            ¿No tienes cuenta?{' '}
            <button className="auth-link" onClick={() => navigate('/register')} type="button">
              Regístrate
            </button>
          </p>
        </section>
      </main>
    </div>
  );
}
