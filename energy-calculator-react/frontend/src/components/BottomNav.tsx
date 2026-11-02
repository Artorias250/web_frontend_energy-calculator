import { Navbar } from "react-bootstrap";
import { NavLink } from "react-router";
import { Icon } from "./Icons";

export function BottomNav() {
  return (
    <Navbar as="nav" className="bottom-nav" aria-label="Основная навигация">
      <NavLink
        to="/appliances-feed"
        className={({ isActive }) => `tab-button ${isActive ? "active" : ""}`}
      >
        <Icon name="feed" />
        <span>Лента</span>
      </NavLink>
      <button
        type="button"
        className="tab-button"
        disabled
        title="Добавление недоступно гостю"
      >
        <Icon name="add" />
        <span>Добавление</span>
      </button>
      <NavLink
        to="/appliances-catalog"
        className={({ isActive }) => `tab-button ${isActive ? "active" : ""}`}
      >
        <Icon name="grid" />
        <span>Плитка</span>
      </NavLink>
      <button
        type="button"
        className="tab-button"
        disabled
        title="Вход будет доступен в следующих работах"
      >
        <Icon name="login" />
        <span>Вход</span>
      </button>
    </Navbar>
  );
}
