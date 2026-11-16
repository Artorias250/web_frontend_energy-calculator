import { useEffect, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { Navigate } from 'react-router';
import { login, errorMessage } from '../api';
import { useAppDispatch, useAppSelector, useBusy } from '../store/hooks';
import { authStarted, authFailed, loggedIn, clearAuthError } from '../store/authSlice';
import { clearApplianceError } from '../store/appliancesSlice';
import { usePageTitle } from '../hooks/usePageTitle';
export function AuthPage() {
  usePageTitle('Вход');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const dispatch = useAppDispatch(); const busy = useBusy();
  const { isAuthenticated, error } = useAppSelector(state => state.auth);
  useEffect(() => { dispatch(clearAuthError()); dispatch(clearApplianceError()); }, [dispatch]);
  if (isAuthenticated) return <Navigate to="/appliances-catalog" replace />;
  return <section className="page auth-page"><h1>Вход</h1>
    <Form onSubmit={async event => {
      event.preventDefault(); if (busy) return;
      dispatch(authStarted());
      try { const user = await login(email, password); dispatch(loggedIn(user)); }
      catch (error) { dispatch(authFailed(errorMessage(error))); }
    }}>
      <fieldset disabled={busy}>
        <Form.Group controlId="login-email"><Form.Label>Электронная почта</Form.Label>
          <Form.Control type="email" autoComplete="username" value={email} required onChange={e => setEmail(e.target.value)} /></Form.Group>
        <Form.Group controlId="login-password"><Form.Label>Пароль</Form.Label>
          <Form.Control type="password" autoComplete="current-password" value={password} required onChange={e => setPassword(e.target.value)} /></Form.Group>
        {error && <Alert variant="danger">{error}</Alert>}
        <Button type="submit">Войти</Button>
      </fieldset>
    </Form>
  </section>;
}
