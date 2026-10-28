import type { Booking, BookingStatus } from "../../api/types";
import { Alert } from "../../components/Alert";
import { FlightInfo } from "../../components/FlightInfo";
import { formatMoney } from "../../lib/format";
import type { CancelState } from "./useBookingLookup";

const statusLabels: Record<BookingStatus, string> = {
  confirmed: "Подтверждена",
  cancelled: "Отменена",
};

interface BookingDetailsProps {
  booking: Booking;
  cancelState: CancelState;
  onCancel: () => void;
}

export const BookingDetails = ({ booking, cancelState, onCancel }: BookingDetailsProps) => (
  <article className="card booking-details" data-testid="booking-details">
    <header className="booking-details__header">
      <h2>
        Бронь{" "}
        <span className="booking-code" data-testid="booking-code">
          {booking.code}
        </span>
      </h2>
      <span
        className={`badge badge--${booking.status}`}
        data-testid="booking-status"
        data-status={booking.status}
      >
        {statusLabels[booking.status]}
      </span>
    </header>

    <FlightInfo flight={booking.flight} />

    <h3>Пассажиры</h3>
    <ul className="passenger-list">
      {booking.passengers.map((passenger) => (
        <li key={`${passenger.lastName}-${passenger.documentNumber}`}>
          {passenger.lastName} {passenger.firstName}
          <span className="muted"> · документ {passenger.documentNumber}</span>
        </li>
      ))}
    </ul>

    <p>
      Контакт: {booking.contact.email}, {booking.contact.phone}
    </p>
    <p className="total">
      Итоговая стоимость: <strong>{formatMoney(booking.totalPrice)}</strong>
    </p>

    {booking.status === "confirmed" && (
      <button
        type="button"
        className="button button--danger"
        data-testid="cancel-booking"
        onClick={onCancel}
        disabled={cancelState.status === "loading"}
      >
        {cancelState.status === "loading" ? "Отменяем…" : "Отменить бронь"}
      </button>
    )}
    {cancelState.status === "error" && (
      <Alert kind="error">Не удалось отменить бронь: {cancelState.message}</Alert>
    )}
  </article>
);
