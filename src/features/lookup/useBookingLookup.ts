import { useCallback, useRef, useState } from "react";

import { ApiError, api, getErrorMessage } from "../../api/client";
import type { Booking } from "../../api/types";
import { failure, idle, loading, type RemoteData, success } from "../../lib/remote";

export type CancelState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string };

interface BookingLookup {
  booking: RemoteData<Booking>;
  cancelState: CancelState;
  find: (code: string, lastName: string) => Promise<void>;
  cancel: () => Promise<void>;
}

const toFailure = (error: unknown): RemoteData<never> =>
  failure(getErrorMessage(error), error instanceof ApiError && error.isNotFound);

export const useBookingLookup = (): BookingLookup => {
  const [booking, setBooking] = useState<RemoteData<Booking>>(idle);
  const [cancelState, setCancelState] = useState<CancelState>({ status: "idle" });
  // Фамилия — второй фактор доступа; для отмены нужна та же, по которой бронь нашли.
  const lastNameRef = useRef("");
  // Номер последнего поиска: ответ на устаревший запрос не перезапишет свежий.
  const requestId = useRef(0);

  const find = useCallback(async (code: string, lastName: string) => {
    requestId.current += 1;
    const current = requestId.current;
    lastNameRef.current = lastName;
    setCancelState({ status: "idle" });
    setBooking(loading);
    let next: RemoteData<Booking>;
    try {
      next = success(await api.getBooking(code, lastName));
    } catch (error) {
      next = toFailure(error);
    }
    if (current === requestId.current) {
      setBooking(next);
    }
  }, []);

  const cancel = useCallback(async () => {
    if (booking.status !== "success" || cancelState.status === "loading") {
      return;
    }
    setCancelState({ status: "loading" });
    try {
      setBooking(success(await api.cancelBooking(booking.data.code, lastNameRef.current)));
      setCancelState({ status: "idle" });
    } catch (error) {
      setCancelState({ status: "error", message: getErrorMessage(error) });
    }
  }, [booking, cancelState.status]);

  return { booking, cancelState, find, cancel };
};
