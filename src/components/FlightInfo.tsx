import type { Flight } from "../api/types";
import { formatDate, formatDuration, formatMoney, formatTime } from "../lib/format";

interface FlightInfoProps {
  flight: Flight;
}

// Сведения о перелёте: общий блок для списка рейсов, оформления и карточки брони.
export const FlightInfo = ({ flight }: FlightInfoProps) => (
  <div className="flight">
    <div className="flight__airline">
      <strong>{flight.airline.name}</strong>
      <span className="muted">Рейс {flight.flightNumber}</span>
    </div>
    <div className="flight__route">
      <div className="flight__point">
        <span className="flight__time">{formatTime(flight.departureAt)}</span>
        <span>{flight.origin.name}</span>
        <span className="muted">{formatDate(flight.departureAt)}</span>
      </div>
      <div className="flight__duration muted">{formatDuration(flight.durationMinutes)}</div>
      <div className="flight__point">
        <span className="flight__time">{formatTime(flight.arrivalAt)}</span>
        <span>{flight.destination.name}</span>
        <span className="muted">{formatDate(flight.arrivalAt)}</span>
      </div>
    </div>
    <div className="flight__price">
      <span className="price">{formatMoney(flight.price)}</span>
      <span className="muted">за пассажира · мест: {flight.seatsAvailable}</span>
    </div>
  </div>
);
