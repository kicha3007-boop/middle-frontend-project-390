import { Link } from "react-router";

import type { Flight } from "../../api/types";
import { Alert } from "../../components/Alert";
import { FlightInfo } from "../../components/FlightInfo";
import { Loader } from "../../components/Loader";
import type { RemoteData } from "../../lib/remote";
import { bookingPath } from "../../routes";

interface FlightListProps {
  flights: RemoteData<Flight[]>;
  passengers: number;
}

export const FlightList = ({ flights, passengers }: FlightListProps) => {
  switch (flights.status) {
    case "idle":
      return null;
    case "loading":
      return <Loader text="Ищем рейсы…" />;
    case "error":
      return (
        <Alert kind="error" testId="flights-error">
          Не удалось загрузить рейсы: {flights.message}
        </Alert>
      );
    case "success":
      if (flights.data.length === 0) {
        return (
          <Alert kind="info" testId="flights-empty">
            Рейсов не найдено. Попробуйте другую дату или направление.
          </Alert>
        );
      }
      return (
        <ul className="flight-list" data-testid="flight-results">
          {flights.data.map((flight) => (
            <li key={flight.id} className="card flight-card" data-testid="flight-result-item">
              <FlightInfo flight={flight} />
              <Link
                to={bookingPath(flight.id)}
                state={{ passengers }}
                className="button button--primary"
                data-testid="book-flight"
              >
                Забронировать
              </Link>
            </li>
          ))}
        </ul>
      );
  }
};
