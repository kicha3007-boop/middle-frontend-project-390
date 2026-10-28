import type { Page, Route } from "@playwright/test";

import type { Booking, City, CreateBookingRequest, Flight } from "../../src/api/types";

// Подмена API в браузере: тесты не ходят в сеть и не зависят от данных сервера и друг от друга.

export const cities: City[] = [
  { code: "MOW", name: "Москва", country: "Россия" },
  { code: "LED", name: "Санкт-Петербург", country: "Россия" },
  { code: "AER", name: "Сочи", country: "Россия" },
];

const makeFlight = (id: string, flightNumber: string, hour: number): Flight => ({
  id,
  flightNumber,
  airline: { code: "SU", name: "Аэрофлот" },
  origin: cities[0],
  destination: cities[1],
  departureAt: `2030-01-15T${String(hour).padStart(2, "0")}:00:00Z`,
  arrivalAt: `2030-01-15T${String(hour + 1).padStart(2, "0")}:30:00Z`,
  durationMinutes: 90,
  price: { amount: 5400, currency: "RUB" },
  seatsAvailable: 42,
});

export const flights: Flight[] = [
  makeFlight("fl_1", "SU1001", 6),
  makeFlight("fl_2", "SU1002", 11),
];

export const existingBooking: Booking = {
  code: "AB12CD",
  status: "confirmed",
  flight: flights[0],
  passengers: [
    {
      firstName: "Иван",
      lastName: "Петров",
      dateOfBirth: "1990-05-12",
      documentNumber: "4509123456",
    },
  ],
  contact: { email: "ivan@example.com", phone: "+79990001122" },
  totalPrice: { amount: 5400, currency: "RUB" },
  createdAt: "2030-01-01T10:00:00Z",
};

type Handler = (route: Route) => Promise<void>;

export interface ApiOverrides {
  cities?: Handler;
  flights?: Handler;
  createBooking?: Handler;
}

export interface ApiLog {
  flightQueries: URLSearchParams[];
  createdBookings: CreateBookingRequest[];
}

export const json = (route: Route, status: number, body: unknown): Promise<void> =>
  route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

const notFound = (route: Route) => json(route, 404, { code: "not_found", message: "Not found" });

export const mockApi = async (page: Page, overrides: ApiOverrides = {}): Promise<ApiLog> => {
  const log: ApiLog = { flightQueries: [], createdBookings: [] };
  const bookings = new Map<string, Booking>([[existingBooking.code, existingBooking]]);

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const { pathname } = url;
    const method = request.method();

    if (method === "GET" && pathname === "/api/cities") {
      return overrides.cities ? overrides.cities(route) : json(route, 200, cities);
    }

    if (method === "GET" && pathname === "/api/flights") {
      log.flightQueries.push(url.searchParams);
      if (overrides.flights) {
        return overrides.flights(route);
      }
      const sameCity = url.searchParams.get("origin") === url.searchParams.get("destination");
      return json(route, 200, sameCity ? [] : flights);
    }

    const flightMatch = /^\/api\/flights\/([^/]+)$/.exec(pathname);
    if (method === "GET" && flightMatch) {
      const flight = flights.find((item) => item.id === decodeURIComponent(flightMatch[1]));
      return flight ? json(route, 200, flight) : notFound(route);
    }

    if (method === "POST" && pathname === "/api/bookings") {
      const body = request.postDataJSON() as CreateBookingRequest;
      log.createdBookings.push(body);
      if (overrides.createBooking) {
        return overrides.createBooking(route);
      }
      const flight = flights.find((item) => item.id === body.flightId) ?? flights[0];
      const booking: Booking = {
        code: "ZX98QW",
        status: "confirmed",
        flight,
        passengers: body.passengers,
        contact: body.contact,
        totalPrice: {
          amount: flight.price.amount * body.passengers.length,
          currency: flight.price.currency,
        },
        createdAt: "2030-01-01T10:00:00Z",
      };
      bookings.set(booking.code, booking);
      return json(route, 201, booking);
    }

    const bookingMatch = /^\/api\/bookings\/([^/]+)(\/cancel)?$/.exec(pathname);
    if (bookingMatch) {
      const booking = bookings.get(decodeURIComponent(bookingMatch[1]));
      const lastName =
        method === "GET"
          ? url.searchParams.get("lastName")
          : (request.postDataJSON() as { lastName: string }).lastName;
      const matches = booking?.passengers.some((p) => p.lastName === lastName);
      if (!booking || !matches) {
        return notFound(route);
      }
      if (method === "POST" && bookingMatch[2]) {
        const cancelled: Booking = { ...booking, status: "cancelled" };
        bookings.set(cancelled.code, cancelled);
        return json(route, 200, cancelled);
      }
      return json(route, 200, booking);
    }

    return notFound(route);
  });

  return log;
};
