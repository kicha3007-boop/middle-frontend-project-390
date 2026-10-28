.PHONY: install build start dev dev-mock mock api test lint lint-fix typecheck

# Установить зависимости строго по lock-файлу.
install:
	npm ci

# Собрать фронтенд в статику (каталог dist/).
build:
	npm run build

# Собранный фронтенд + API на одном origin (порт 8080 или $$PORT).
start:
	npx frontend-flight-booking-server start -s dist

# Дев-сервер Vite; /api проксируется на реальный сервер (make api).
dev:
	npm run dev

# Дев-сервер Vite с прокси /api на Prism-мок (make mock).
dev-mock:
	API_PROXY_TARGET=http://localhost:4010 npm run dev

# Мок API из спецификации contract/openapi.yaml на порту 4010.
mock:
	npm run mock

# Только API без статики на порту 8080.
api:
	npm run api

# Свои browser-тесты; адрес приложения берётся из APP_URL.
test:
	npm test

lint:
	npm run lint

lint-fix:
	npm run lint:fix

typecheck:
	npm run typecheck
