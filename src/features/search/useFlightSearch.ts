import { useEffect, useState } from "react";

import { api, getErrorMessage, isAbortError } from "../../api/client";
import type { Flight, FlightSearchParams } from "../../api/types";
import { failure, idle, loading, type RemoteData, success } from "../../lib/remote";

// Ищет рейсы при каждой смене параметров; устаревший запрос отменяется,
// поэтому его ответ не перезапишет результат нового поиска.
export const useFlightSearch = (params: FlightSearchParams | null): RemoteData<Flight[]> => {
  const [flights, setFlights] = useState<RemoteData<Flight[]>>(idle);

  useEffect(() => {
    if (!params) {
      return undefined;
    }
    const controller = new AbortController();
    setFlights(loading);
    api
      .searchFlights(params, controller.signal)
      .then((data) => setFlights(success(data)))
      .catch((error: unknown) => {
        if (!isAbortError(error)) {
          setFlights(failure(getErrorMessage(error)));
        }
      });
    return () => controller.abort();
  }, [params]);

  return flights;
};
