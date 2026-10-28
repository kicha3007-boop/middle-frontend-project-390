import type {
  ApiErrorBody,
  Booking,
  City,
  CreateBookingRequest,
  Flight,
  FlightSearchParams,
} from "./types";

// Все обращения к API — только здесь. Пути относительные: фронтенд и API живут на одном origin.
const API_PREFIX = "/api";

export class ApiError extends Error {
  // status = 0 — запрос не дошёл до сервера (сеть, CORS, отмена).
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }
}

const isErrorBody = (value: unknown): value is ApiErrorBody =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { message?: unknown }).message === "string";

const readErrorMessage = async (response: Response): Promise<string> => {
  try {
    const body: unknown = await response.json();
    if (isErrorBody(body)) {
      return body.message;
    }
  } catch {
    // Тело не JSON — используем общий текст ниже.
  }
  return `Сервер ответил ошибкой ${response.status}`;
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(`${API_PREFIX}${path}`, {
      ...init,
      headers: { Accept: "application/json", ...init.headers },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    throw new ApiError(0, "Не удалось связаться с сервером. Проверьте подключение.");
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response));
  }

  return (await response.json()) as T;
};

const postJson = <T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> =>
  request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

export const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === "AbortError";

export const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Неизвестная ошибка";

export const api = {
  getCities: (signal?: AbortSignal): Promise<City[]> => request<City[]>("/cities", { signal }),

  searchFlights: (params: FlightSearchParams, signal?: AbortSignal): Promise<Flight[]> => {
    const query = new URLSearchParams({
      origin: params.origin,
      destination: params.destination,
      date: params.date,
      passengers: String(params.passengers),
    });
    return request<Flight[]>(`/flights?${query.toString()}`, { signal });
  },

  getFlight: (id: string, signal?: AbortSignal): Promise<Flight> =>
    request<Flight>(`/flights/${encodeURIComponent(id)}`, { signal }),

  createBooking: (body: CreateBookingRequest): Promise<Booking> =>
    postJson<Booking>("/bookings", body),

  getBooking: (code: string, lastName: string): Promise<Booking> => {
    const query = new URLSearchParams({ lastName });
    return request<Booking>(`/bookings/${encodeURIComponent(code)}?${query.toString()}`);
  },

  cancelBooking: (code: string, lastName: string): Promise<Booking> =>
    postJson<Booking>(`/bookings/${encodeURIComponent(code)}/cancel`, { lastName }),
};
