import { Link } from "react-router";

import type { Booking } from "../../api/types";
import { formatMoney } from "../../lib/format";
import { routes } from "../../routes";

interface BookingSuccessProps {
  booking: Booking;
}

export const BookingSuccess = ({ booking }: BookingSuccessProps) => (
  <section className="card success" data-testid="booking-success" aria-live="polite">
    <h2>Бронь оформлена</h2>
    <p>
      Код бронирования:{" "}
      <strong className="booking-code" data-testid="booking-code">
        {booking.code}
      </strong>
    </p>
    <p>
      Пассажиров: {booking.passengers.length}. Итого к оплате:{" "}
      <strong>{formatMoney(booking.totalPrice)}</strong>
    </p>
    <p className="muted">
      Сохраните код — по нему и фамилии пассажира бронь можно найти в разделе{" "}
      <Link to={routes.lookup}>«Мои брони»</Link>.
    </p>
  </section>
);
