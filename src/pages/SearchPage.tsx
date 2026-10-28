import { useMemo, useState } from "react";

import type { City, FlightSearchParams } from "../api/types";
import { Alert } from "../components/Alert";
import { Loader } from "../components/Loader";
import { FlightList } from "../features/search/FlightList";
import { SearchForm } from "../features/search/SearchForm";
import { useCities } from "../features/search/useCities";
import { useFlightSearch } from "../features/search/useFlightSearch";
import { isoDateFromToday } from "../lib/format";

// Значения по умолчанию: первые два города из API, завтрашний день, один пассажир.
const defaultSearch = (cities: City[]): FlightSearchParams | null => {
  if (cities.length === 0) {
    return null;
  }
  return {
    origin: cities[0].code,
    destination: (cities[1] ?? cities[0]).code,
    date: isoDateFromToday(1),
    passengers: 1,
  };
};

export const SearchPage = () => {
  const cities = useCities();
  const [userQuery, setUserQuery] = useState<FlightSearchParams | null>(null);

  const initialQuery = useMemo(
    () => (cities.status === "success" ? defaultSearch(cities.data) : null),
    [cities],
  );
  const query = userQuery ?? initialQuery;
  const flights = useFlightSearch(query);

  return (
    <>
      <h1>Поиск авиабилетов</h1>
      {cities.status === "loading" && <Loader text="Загружаем города…" />}
      {cities.status === "error" && (
        <Alert kind="error" testId="flights-error">
          Не удалось загрузить список городов: {cities.message}
        </Alert>
      )}
      {cities.status === "success" && initialQuery && (
        <SearchForm cities={cities.data} initialValues={initialQuery} onSearch={setUserQuery} />
      )}
      {cities.status === "success" && !initialQuery && (
        <Alert kind="info">Список городов пуст — искать пока негде.</Alert>
      )}
      <section className="results" aria-label="Найденные рейсы">
        <FlightList flights={flights} passengers={query?.passengers ?? 1} />
      </section>
    </>
  );
};
