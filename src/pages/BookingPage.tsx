import { Link, useLocation, useParams } from "react-router";

import { Alert } from "../components/Alert";
import { Loader } from "../components/Loader";
import { FlightInfo } from "../components/FlightInfo";
import { BookingForm } from "../features/booking/BookingForm";
import { BookingSuccess } from "../features/booking/BookingSuccess";
import { useCreateBooking } from "../features/booking/useCreateBooking";
import { useFlight } from "../features/booking/useFlight";
import { routes } from "../routes";

// Число пассажиров приходит из поиска через state ссылки; при прямом заходе — один.
const passengersFromState = (state: unknown): number => {
  if (typeof state === "object" && state !== null && "passengers" in state) {
    const { passengers } = state as { passengers: unknown };
    if (typeof passengers === "number" && passengers > 0) {
      return passengers;
    }
  }
  return 1;
};

export const BookingPage = () => {
  const { flightId = "" } = useParams();
  const location = useLocation();
  const flight = useFlight(flightId);
  const booking = useCreateBooking();

  if (flight.status === "loading" || flight.status === "idle") {
    return (
      <>
        <h1>Оформление брони</h1>
        <Loader text="Загружаем рейс…" />
      </>
    );
  }

  if (flight.status === "error") {
    return (
      <>
        <h1>Оформление брони</h1>
        {flight.notFound ? (
          <Alert kind="error" testId="flight-not-found">
            Рейс «{flightId}» не найден. Возможно, ссылка устарела —{" "}
            <Link to={routes.home}>найдите рейс заново</Link>.
          </Alert>
        ) : (
          <Alert kind="error" testId="booking-error">
            Не удалось загрузить рейс: {flight.message}
          </Alert>
        )}
      </>
    );
  }

  return (
    <>
      <h1>Оформление брони</h1>
      <section className="card" data-testid="booking-flight" aria-label="Выбранный рейс">
        <FlightInfo flight={flight.data} />
      </section>
      {booking.state.status === "success" ? (
        <BookingSuccess booking={booking.state.data} />
      ) : (
        <BookingForm
          flightId={flight.data.id}
          initialPassengers={passengersFromState(location.state)}
          submitting={booking.state.status === "loading"}
          serverError={booking.state.status === "error" ? booking.state.message : null}
          onSubmit={booking.submit}
        />
      )}
    </>
  );
};
