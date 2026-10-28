# Фронтенд для бронирования авиабилетов

[![hexlet-check](https://github.com/kicha3007-boop/middle-frontend-project-390/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/kicha3007-boop/middle-frontend-project-390/actions)
[![ci](https://github.com/kicha3007-boop/middle-frontend-project-390/actions/workflows/ci.yml/badge.svg)](https://github.com/kicha3007-boop/middle-frontend-project-390/actions/workflows/ci.yml)

Одностраничное приложение сервиса бронирования авиабилетов: поиск рейсов, оформление брони и
просмотр/отмена брони по коду. Бэкенд предоставляет Хекслет — пакет
[`@hexlet/frontend-flight-booking-server`](https://www.npmjs.com/package/@hexlet/frontend-flight-booking-server),
контракт API лежит в [`contract/openapi.yaml`](contract/openapi.yaml) (сгенерирован из TypeSpec
[`contract/main.tsp`](contract/main.tsp)).

Учебный проект Хекслета: https://ru.hexlet.io/programs/middle-frontend

Приложение запускается локально (см. ниже), в облако не разворачивается.

## Возможности

- **Поиск рейсов** (`/`): города приходят из API, на главной сразу показаны рейсы по умолчанию
  (первые два города, завтрашняя дата, один пассажир); есть состояния загрузки, пустого результата и ошибки.
- **Оформление брони** (`/booking/<id рейса>`): открывается и прямой ссылкой, рейс подгружается по `id`;
  контакт и пассажиры (можно добавить и удалить пассажира), клиентская валидация, ошибки сервера,
  после успеха — код брони из 6 символов.
- **Мои брони** (`/lookup`): поиск по коду и фамилии, карточка брони (рейс, пассажиры, статус, итоговая
  стоимость из ответа сервера), отмена брони.
- **Мониторинг ошибок**: Sentry SDK (совместим с Bugsink), включается только в прод-сборке при заданном
  `VITE_SENTRY_DSN`.

## Стек

- TypeScript, React 19, React Router 7, Vite
- Playwright — browser-тесты
- oxlint и oxfmt — линтер и форматирование

## Требования

- Node.js 22.12 или новее, npm
- GNU Make (на Windows — например, из Git Bash)

## Установка

```bash
git clone https://github.com/kicha3007-boop/middle-frontend-project-390.git
cd middle-frontend-project-390
make install
```

Переменные окружения необязательны. Пример — в [`.env.example`](.env.example): `VITE_SENTRY_DSN` нужен,
только если хотите отправлять ошибки прод-сборки в Bugsink/Sentry (скопируйте файл в `.env` и
укажите DSN перед `make build`).

## Запуск

### Как в проде: собранное приложение и API на одном порту

```bash
make build   # собрать статику в dist/
make start   # статика + API на http://localhost:8080
```

`make start` поднимает сервер из пакета `@hexlet/frontend-flight-booking-server`: он раздаёт `dist/`
(с SPA-фолбэком на `index.html`) и API `/api/...` на одном origin. Порт можно сменить переменной `PORT`.
Данные (рейсы на 30 дней вперёд) генерируются при старте, брони хранятся в памяти и сбрасываются при
перезапуске.

### Разработка с реальным API

```bash
make api     # терминал 1: API на http://localhost:8080
make dev     # терминал 2: Vite на http://localhost:5173, /api проксируется на :8080
```

### Разработка против мока из спецификации

```bash
make mock      # терминал 1: Prism-мок по contract/openapi.yaml на http://localhost:4010
make dev-mock  # терминал 2: Vite, /api проксируется на мок
```

Мок отвечает примерами из контракта: данные ненастоящие и не сохраняются.

Во всех режимах фронтенд обращается к API только по относительным путям `/api/...`; адрес бэкенда
знает лишь прокси дев-сервера (`vite.config.ts`), в код и сборку он не попадает.

## Тесты

Browser-тесты на Playwright лежат в `tests/e2e/` и покрывают все пользовательские сценарии: главная,
поиск (по умолчанию, ручной, пустой результат, ошибка), оформление (прямая ссылка, рейс не найден,
валидация, успех, добавление пассажира, ошибка сервера), просмотр и отмена брони. Запросы к API в
тестах подменяются через `page.route`, поэтому тесты не зависят от данных сервера и друг от друга.

Адрес приложения берётся из переменной `APP_URL`:

```bash
npx playwright install chromium        # один раз — браузер для тестов
make build && make start               # терминал 1
APP_URL=http://localhost:8080 make test  # терминал 2
```

Тесты можно гонять и против дев-сервера: `APP_URL=http://localhost:5173 make test`.
Отчёт о прогоне — в `tmp/playwright-report/index.html`.

## Линтер и проверка типов

```bash
make lint        # oxlint + проверка форматирования oxfmt
make lint-fix    # автоисправление
make typecheck   # tsc
```

## CI

Workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) на каждый пуш и pull request ставит
зависимости, запускает линтер, собирает приложение, поднимает его через `make start` и прогоняет
browser-тесты. Workflow `hexlet-check.yml` — автопроверка Хекслета, его не трогаем.

## Структура

```text
contract/              контракт API (OpenAPI + TypeSpec)
src/
  api/                 типы данных и единственный модуль запросов к API
  components/          общие компоненты (раскладка, карточка рейса, поле формы, сообщения)
  features/search/     форма поиска, список рейсов, загрузка городов и рейсов
  features/booking/    форма брони, модель и валидация формы, создание брони
  features/lookup/     поиск брони, карточка брони, отмена
  pages/               экраны: поиск, оформление, «Мои брони», 404
  routes.ts            адреса экранов
  router.tsx           маршрутизатор
  monitoring.ts        инициализация Sentry/Bugsink
tests/e2e/             browser-тесты Playwright и подмена API
```

---

<details>
<summary>Автоматические тесты Хекслета</summary>

Тесты запускаются на каждый коммит. За запуск отвечает файл `.github/workflows/hexlet-check.yml` — не удаляйте и не переименовывайте ни его, ни репозиторий.

</details>

## О Хекслете

[Хекслет](https://ru.hexlet.io/) — школа программирования: авторские программы обучения с практикой, поддержкой наставников и реальными проектами, которые остаются в резюме. Этот репозиторий — один из таких проектов.
