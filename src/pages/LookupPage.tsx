import { Alert } from "../components/Alert";
import { Loader } from "../components/Loader";
import { BookingDetails } from "../features/lookup/BookingDetails";
import { LookupForm } from "../features/lookup/LookupForm";
import { useBookingLookup } from "../features/lookup/useBookingLookup";

export const LookupPage = () => {
  const { booking, cancelState, find, cancel } = useBookingLookup();

  return (
    <>
      <h1>Мои брони</h1>
      <p className="muted">Найдите бронь по коду бронирования и фамилии любого из пассажиров.</p>
      <LookupForm
        disabled={booking.status === "loading"}
        onSubmit={(code, lastName) => void find(code, lastName)}
      />

      {booking.status === "loading" && <Loader text="Ищем бронь…" />}
      {booking.status === "error" &&
        (booking.notFound ? (
          <Alert kind="error" testId="booking-not-found">
            Бронь не найдена. Проверьте код бронирования и фамилию.
          </Alert>
        ) : (
          <Alert kind="error" testId="lookup-error">
            Не удалось найти бронь: {booking.message}
          </Alert>
        ))}
      {booking.status === "success" && (
        <BookingDetails
          booking={booking.data}
          cancelState={cancelState}
          onCancel={() => void cancel()}
        />
      )}
    </>
  );
};
