import type { ReactNode } from "react";

interface AlertProps {
  kind: "error" | "info";
  testId?: string;
  children: ReactNode;
}

// Сообщение для пользователя: ошибки объявляются скринридерам сразу, остальное — вежливо.
export const Alert = ({ kind, testId, children }: AlertProps) =>
  kind === "error" ? (
    <div className="alert alert--error" role="alert" data-testid={testId}>
      {children}
    </div>
  ) : (
    <div className="alert alert--info" aria-live="polite" data-testid={testId}>
      {children}
    </div>
  );
