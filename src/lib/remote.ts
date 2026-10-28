// Состояние асинхронной загрузки описано одним значением, а не набором флагов:
// «загрузка» и «ошибка» не могут оказаться истинными одновременно.
export type RemoteData<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string; notFound: boolean };

export const idle: RemoteData<never> = { status: "idle" };
export const loading: RemoteData<never> = { status: "loading" };

export const success = <T>(data: T): RemoteData<T> => ({ status: "success", data });

export const failure = (message: string, notFound = false): RemoteData<never> => ({
  status: "error",
  message,
  notFound,
});
