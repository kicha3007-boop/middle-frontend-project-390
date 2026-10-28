import { useEffect, useState } from "react";

import { api, getErrorMessage, isAbortError } from "../../api/client";
import type { City } from "../../api/types";
import { failure, loading, type RemoteData, success } from "../../lib/remote";

export const useCities = (): RemoteData<City[]> => {
  const [cities, setCities] = useState<RemoteData<City[]>>(loading);

  useEffect(() => {
    const controller = new AbortController();
    api
      .getCities(controller.signal)
      .then((data) => setCities(success(data)))
      .catch((error: unknown) => {
        if (!isAbortError(error)) {
          setCities(failure(getErrorMessage(error)));
        }
      });
    return () => controller.abort();
  }, []);

  return cities;
};
