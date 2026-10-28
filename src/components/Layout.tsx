import { Link, NavLink, Outlet } from "react-router";

import { routes } from "../routes";

const navClassName = ({ isActive }: { isActive: boolean }): string =>
  isActive ? "nav__link nav__link--active" : "nav__link";

export const Layout = () => (
  <div className="layout">
    <header className="header">
      <div className="container header__inner">
        <Link to={routes.home} className="logo">
          ✈ Авиабилеты
        </Link>
        <nav className="nav" aria-label="Основная навигация">
          <NavLink to={routes.home} end className={navClassName}>
            Поиск рейсов
          </NavLink>
          <NavLink to={routes.lookup} className={navClassName} data-testid="nav-lookup">
            Мои брони
          </NavLink>
        </nav>
      </div>
    </header>
    <main className="container main">
      <Outlet />
    </main>
  </div>
);
