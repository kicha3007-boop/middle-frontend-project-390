import { useEffect, useState } from "react";

import { ApiError, api, getErrorMessage, isAbortError } from "../../api/client";
import type { Flight } from "../../api/types";
import { failure, loading, type RemoteData, success } from "../../lib/remote";

// Рейс по id из адреса: страница оформления открывается и прямой ссылкой, без поиска.
export const useFlight = (flightId: string): RemoteData<Flight> => {
  const [flight, setFlight] = useState<RemoteData<Flight>>(loading);

  useEffect(() => {
    const controller = new AbortController();
    setFlight(loading);
    api
      .getFlight(flightId, controller.signal)
      .then((data) => setFlight(success(data)))
      .catch((error: unknown) => {
        if (!isAbortError(error)) {
          const notFound = error instanceof ApiError && error.isNotFound;
          setFlight(failure(getErrorMessage(error), notFound));
        }
      });
    return () => controller.abort();
  }, [flightId]);

  return flight;
};
