import { Navbar } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router';
import { Icon } from './Icons';
import { logout, errorMessage } from '../api';
import { useAppDispatch, useAppSelector, useBusy } from '../store/hooks';
import { authStarted, authFailed, loggedOut } from '../store/authSlice';
import axios from 'axios';
export function BottomNav() {
  const dispatch = useAppDispatch(); const navigate = useNavigate(); const busy = useBusy();
  const { isAuthenticated, user } = useAppSelector(state => state.auth);
  const cls = ({ isActive }: { isActive: boolean }) => `tab-button ${isActive ? 'active' : ''}`;
  async function exit() {
    dispatch(authStarted());
    try { await logout(); dispatch(loggedOut()); navigate('/appliances-catalog'); }
    catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) { dispatch(loggedOut()); navigate('/appliances-catalog'); }
      else { dispatch(authFailed(errorMessage(error))); }
    }
  }
  return <>
    {isAuthenticated && <div className="account-label">{user?.userName}</div>}
    <Navbar as="nav" className={`bottom-nav ${busy ? 'nav-busy' : ''}`} aria-label="Основная навигация">
      <NavLink to="/appliances-feed" className={cls}><Icon name="feed" /><span>Лента</span></NavLink>
      {isAuthenticated ? <NavLink to="/appliances-draft" className={cls}><Icon name="add" /><span>Добавление</span></NavLink>
        : <button className="tab-button" disabled title="Добавление доступно после входа"><Icon name="add" /><span>Добавление</span></button>}
      <NavLink to="/appliances-catalog" className={cls}><Icon name="grid" /><span>Плитка</span></NavLink>
      {isAuthenticated ? <button className="tab-button" disabled={busy} onClick={() => void exit()}><Icon name="login" /><span>Выход</span></button>
        : <NavLink to="/login" className={cls}><Icon name="login" /><span>Вход</span></NavLink>}
    </Navbar>
  </>;
}
