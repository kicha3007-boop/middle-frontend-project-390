import { type FormEvent, useState } from "react";

import type { City, FlightSearchParams } from "../../api/types";

const MAX_PASSENGERS = 9;

const clampPassengers = (raw: string): number => {
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? 1 : Math.min(Math.max(parsed, 1), MAX_PASSENGERS);
};

interface SearchFormProps {
  cities: City[];
  initialValues: FlightSearchParams;
  onSearch: (params: FlightSearchParams) => void;
}

export const SearchForm = ({ cities, initialValues, onSearch }: SearchFormProps) => {
  const [values, setValues] = useState<FlightSearchParams>(initialValues);
  const [dateError, setDateError] = useState<string | null>(null);

  const update = <K extends keyof FlightSearchParams>(key: K, value: FlightSearchParams[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values.date) {
      setDateError("Укажите дату вылета");
      return;
    }
    setDateError(null);
    // Новый объект — даже повторный поиск с теми же параметрами перезапрашивает рейсы.
    onSearch({ ...values });
  };

  const cityOptions = cities.map((city) => (
    <option key={city.code} value={city.code}>
      {city.name}
    </option>
  ));

  return (
    <form
      className="card search-form"
      data-testid="flight-search-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="field">
        <label htmlFor="search-origin">Откуда</label>
        <select
          id="search-origin"
          data-testid="search-origin"
          value={values.origin}
          onChange={(event) => update("origin", event.target.value)}
        >
          {cityOptions}
        </select>
      </div>
      <div className="field">
        <label htmlFor="search-destination">Куда</label>
        <select
          id="search-destination"
          data-testid="search-destination"
          value={values.destination}
          onChange={(event) => update("destination", event.target.value)}
        >
          {cityOptions}
        </select>
      </div>
      <div className="field">
        <label htmlFor="search-date">Дата вылета</label>
        <input
          id="search-date"
          type="date"
          data-testid="search-date"
          value={values.date}
          aria-invalid={dateError ? true : undefined}
          onChange={(event) => update("date", event.target.value)}
        />
        {dateError && <span className="field__error">{dateError}</span>}
      </div>
      <div className="field">
        <label htmlFor="search-passengers">Пассажиров</label>
        <input
          id="search-passengers"
          type="number"
          min={1}
          max={MAX_PASSENGERS}
          data-testid="search-passengers"
          value={values.passengers}
          onChange={(event) => update("passengers", clampPassengers(event.target.value))}
        />
      </div>
      <button type="submit" className="button button--primary" data-testid="search-submit">
        Найти
      </button>
    </form>
  );
};
