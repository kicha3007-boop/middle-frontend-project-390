import { Link } from "react-router";

import { routes } from "../routes";

export const NotFoundPage = () => (
  <>
    <h1>Страница не найдена</h1>
    <p>
      Такого адреса нет. Перейдите к <Link to={routes.home}>поиску рейсов</Link>.
    </p>
  </>
);
