import { useCallback, useRef, useState } from "react";

import { api, getErrorMessage } from "../../api/client";
import type { Booking, CreateBookingRequest } from "../../api/types";
import { failure, idle, loading, type RemoteData, success } from "../../lib/remote";

interface CreateBookingState {
  state: RemoteData<Booking>;
  submit: (request: CreateBookingRequest) => void;
}

export const useCreateBooking = (): CreateBookingState => {
  const [state, setState] = useState<RemoteData<Booking>>(idle);
  // Защита от двойной отправки: пока запрос в пути, вторая бронь не создаётся.
  const inFlight = useRef(false);

  const submit = useCallback((request: CreateBookingRequest) => {
    if (inFlight.current) {
      return;
    }
    inFlight.current = true;
    setState(loading);
    api
      .createBooking(request)
      .then((booking) => setState(success(booking)))
      .catch((error: unknown) => setState(failure(getErrorMessage(error))))
      .finally(() => {
        inFlight.current = false;
      });
  }, []);

  return { state, submit };
};
