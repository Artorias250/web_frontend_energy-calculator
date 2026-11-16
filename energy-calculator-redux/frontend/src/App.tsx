import { Navigate, Route, Routes } from 'react-router';
import { Alert, Spinner } from 'react-bootstrap';
import { BottomNav } from './components/BottomNav';
import { CatalogPage } from './pages/CatalogPage';
import { FeedPage } from './pages/FeedPage';
import { DraftPage } from './pages/DraftPage';
import { AuthPage } from './pages/AuthPage';
import { useAppSelector, useBusy } from './store/hooks';
export default function App() {
  const busy = useBusy();
  const { error } = useAppSelector(state => state.appliances);
  const authError = useAppSelector(state => state.auth.error);
  const authenticated = useAppSelector(state => state.auth.isAuthenticated);
  return <div className="app-shell" aria-busy={busy}>
    <main className="app-content">
      {authenticated && authError && <Alert variant="danger">{authError}</Alert>}
      {error && <Alert role="alert" variant="danger" className="request-error">{error}</Alert>}
      <Routes>
        <Route path="/" element={<Navigate to="/appliances-catalog" replace />} />
        <Route path="/appliances-catalog" element={<CatalogPage />} />
        <Route path="/appliances-feed" element={<FeedPage />} />
        <Route path="/appliances-feed/:id" element={<FeedPage />} />
        <Route path="/appliances-draft" element={authenticated ? <DraftPage /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="*" element={<section className="page"><h1>Страница не найдена</h1></section>} />
      </Routes>
    </main>
    <BottomNav />
    {busy && <div className="loading-overlay" role="status"><Spinner animation="border" /><span>Выполняется запрос…</span></div>}
  </div>;
}
