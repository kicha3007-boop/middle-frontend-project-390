import type { CreateBookingRequest, Passenger } from "../../api/types";

// Значения формы брони и их клиентская валидация — без разметки и без запросов.

export interface BookingFormValues {
  email: string;
  phone: string;
  passengers: Passenger[];
}

export type PassengerField = keyof Passenger;

// Ключи ошибок: "email", "phone", "passengers.<i>.<поле>".
export type BookingFormErrors = Record<string, string>;

export const passengerFields: { name: PassengerField; label: string; type: string }[] = [
  { name: "firstName", label: "Имя", type: "text" },
  { name: "lastName", label: "Фамилия", type: "text" },
  { name: "dateOfBirth", label: "Дата рождения", type: "date" },
  { name: "documentNumber", label: "Номер документа", type: "text" },
];

// Хвост data-testid поля пассажира задан чек-листом: passenger-<i>-firstName / -lastName / -dob / -document.
export const passengerTestIdSuffix: Record<PassengerField, string> = {
  firstName: "firstName",
  lastName: "lastName",
  dateOfBirth: "dob",
  documentNumber: "document",
};

export const emptyPassenger = (): Passenger => ({
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  documentNumber: "",
});

export const initialBookingValues = (passengersCount: number): BookingFormValues => ({
  email: "",
  phone: "",
  passengers: Array.from({ length: Math.max(passengersCount, 1) }, emptyPassenger),
});

export const passengerErrorKey = (index: number, field: PassengerField): string =>
  `passengers.${index}.${field}`;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[\d\s()-]{5,}$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const validateBooking = (values: BookingFormValues): BookingFormErrors => {
  const errors: BookingFormErrors = {};

  const email = values.email.trim();
  if (!email) {
    errors.email = "Укажите email";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Email в формате name@example.com";
  }

  const phone = values.phone.trim();
  if (!phone) {
    errors.phone = "Укажите телефон";
  } else if (!PHONE_PATTERN.test(phone)) {
    errors.phone = "Телефон из цифр, например +79990001122";
  }

  values.passengers.forEach((passenger, index) => {
    for (const { name, label } of passengerFields) {
      if (!passenger[name].trim()) {
        errors[passengerErrorKey(index, name)] = `Заполните поле «${label}»`;
      }
    }
    if (passenger.dateOfBirth && !DATE_PATTERN.test(passenger.dateOfBirth)) {
      errors[passengerErrorKey(index, "dateOfBirth")] = "Дата в формате ГГГГ-ММ-ДД";
    }
  });

  return errors;
};

export const toBookingRequest = (
  flightId: string,
  values: BookingFormValues,
): CreateBookingRequest => ({
  flightId,
  contact: { email: values.email.trim(), phone: values.phone.trim() },
  passengers: values.passengers.map((passenger) => ({
    firstName: passenger.firstName.trim(),
    lastName: passenger.lastName.trim(),
    dateOfBirth: passenger.dateOfBirth,
    documentNumber: passenger.documentNumber.trim(),
  })),
});
