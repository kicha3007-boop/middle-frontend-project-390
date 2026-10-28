import * as Sentry from "@sentry/react";

// Мониторинг ошибок (Bugsink совместим с Sentry SDK). DSN приходит из окружения сборки
// (VITE_SENTRY_DSN) и в репозитории не хранится; без DSN и вне прод-сборки мониторинг выключен.
export const initMonitoring = (): void => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!import.meta.env.PROD || !dsn) {
    return;
  }
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
  });
};
