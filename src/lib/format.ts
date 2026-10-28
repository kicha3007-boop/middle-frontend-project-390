import type { Money } from "../api/types";

const timeFormatter = new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  weekday: "short",
  timeZone: "UTC",
});

// Время в API — в UTC; показываем его как есть, чтобы не зависеть от часового пояса браузера.
export const formatTime = (iso: string): string => timeFormatter.format(new Date(iso));

export const formatDate = (iso: string): string => dateFormatter.format(new Date(iso));

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours > 0 ? `${hours} ч ${rest} мин` : `${rest} мин`;
};

export const formatMoney = (money: Money): string =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: money.currency,
    maximumFractionDigits: 0,
  }).format(money.amount);

// Дата в формате YYYY-MM-DD через days дней от сегодняшнего дня (UTC) — как в расписании API.
export const isoDateFromToday = (days: number): string => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};
