// Адреса экранов — единственное место, где они записаны строками.
export const routes = {
  home: "/",
  booking: "/booking/:flightId",
  lookup: "/lookup",
} as const;

export const bookingPath = (flightId: string): string => `/booking/${encodeURIComponent(flightId)}`;
