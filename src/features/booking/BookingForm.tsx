import { type FormEvent, useState } from "react";

import type { CreateBookingRequest } from "../../api/types";
import { Alert } from "../../components/Alert";
import { Field } from "../../components/Field";
import {
  type BookingFormErrors,
  type BookingFormValues,
  emptyPassenger,
  initialBookingValues,
  type PassengerField,
  toBookingRequest,
  validateBooking,
} from "./bookingFormModel";
import { PassengerFields } from "./PassengerFields";

const MAX_PASSENGERS = 9;

interface BookingFormProps {
  flightId: string;
  initialPassengers: number;
  submitting: boolean;
  serverError: string | null;
  onSubmit: (request: CreateBookingRequest) => void;
}

export const BookingForm = ({
  flightId,
  initialPassengers,
  submitting,
  serverError,
  onSubmit,
}: BookingFormProps) => {
  const [values, setValues] = useState<BookingFormValues>(() =>
    initialBookingValues(initialPassengers),
  );
  const [errors, setErrors] = useState<BookingFormErrors>({});

  const setContact = (field: "email" | "phone", value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  const setPassenger = (index: number, field: PassengerField, value: string) =>
    setValues((current) => ({
      ...current,
      passengers: current.passengers.map((passenger, i) =>
        i === index ? { ...passenger, [field]: value } : passenger,
      ),
    }));

  const addPassenger = () =>
    setValues((current) => ({
      ...current,
      passengers: [...current.passengers, emptyPassenger()],
    }));

  const removePassenger = (index: number) => {
    setValues((current) => ({
      ...current,
      passengers: current.passengers.filter((_, i) => i !== index),
    }));
    // Ошибки привязаны к индексам — после удаления их проще пересчитать при следующей отправке.
    setErrors({});
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateBooking(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0 || submitting) {
      return;
    }
    onSubmit(toBookingRequest(flightId, values));
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form
      className="card booking-form"
      data-testid="booking-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <fieldset className="contact" disabled={submitting}>
        <legend>Контакт для связи</legend>
        <div className="grid">
          <Field
            id="contact-email"
            testId="contact-email"
            label="Email"
            type="email"
            autoComplete="email"
            value={values.email}
            error={errors.email}
            onChange={(event) => setContact("email", event.target.value)}
          />
          <Field
            id="contact-phone"
            testId="contact-phone"
            label="Телефон"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            error={errors.phone}
            onChange={(event) => setContact("phone", event.target.value)}
          />
        </div>
      </fieldset>

      {values.passengers.map((passenger, index) => (
        <PassengerFields
          // Пассажиры не переупорядочиваются, а удаление сбрасывает ошибки — индекс годится как ключ.
          key={index}
          index={index}
          passenger={passenger}
          errors={errors}
          onChange={setPassenger}
          onRemove={values.passengers.length > 1 ? removePassenger : undefined}
        />
      ))}

      <div className="actions">
        <button
          type="button"
          className="button"
          data-testid="add-passenger"
          onClick={addPassenger}
          disabled={submitting || values.passengers.length >= MAX_PASSENGERS}
        >
          + Добавить пассажира
        </button>
        <button
          type="submit"
          className="button button--primary"
          data-testid="booking-submit"
          disabled={submitting}
        >
          {submitting ? "Оформляем…" : "Забронировать"}
        </button>
      </div>

      {hasErrors && (
        <p className="field__error" role="alert">
          Заполните обязательные поля, отмеченные выше.
        </p>
      )}
      {serverError && (
        <Alert kind="error" testId="booking-error">
          Не удалось оформить бронь: {serverError}
        </Alert>
      )}
    </form>
  );
};
