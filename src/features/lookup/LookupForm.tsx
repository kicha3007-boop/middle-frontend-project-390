import { type FormEvent, useState } from "react";

import { Field } from "../../components/Field";

interface LookupFormProps {
  disabled: boolean;
  onSubmit: (code: string, lastName: string) => void;
}

interface LookupErrors {
  code?: string;
  lastName?: string;
}

const CODE_PATTERN = /^[A-Z0-9]{6}$/;

const validate = (code: string, lastName: string): LookupErrors => {
  const errors: LookupErrors = {};
  if (!code) {
    errors.code = "Укажите код бронирования";
  } else if (!CODE_PATTERN.test(code)) {
    errors.code = "Код — 6 латинских букв и цифр, например AB12CD";
  }
  if (!lastName) {
    errors.lastName = "Укажите фамилию пассажира";
  }
  return errors;
};

export const LookupForm = ({ disabled, onSubmit }: LookupFormProps) => {
  const [code, setCode] = useState("");
  const [lastName, setLastName] = useState("");
  const [errors, setErrors] = useState<LookupErrors>({});

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedCode = code.trim().toUpperCase();
    const normalizedLastName = lastName.trim();
    const validationErrors = validate(normalizedCode, normalizedLastName);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      onSubmit(normalizedCode, normalizedLastName);
    }
  };

  return (
    <form
      className="card lookup-form"
      data-testid="booking-lookup-form"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="grid">
        <Field
          id="lookup-code"
          testId="lookup-code"
          label="Код бронирования"
          value={code}
          maxLength={6}
          autoCapitalize="characters"
          error={errors.code}
          onChange={(event) => setCode(event.target.value)}
        />
        <Field
          id="lookup-lastName"
          testId="lookup-lastName"
          label="Фамилия пассажира"
          value={lastName}
          autoComplete="family-name"
          error={errors.lastName}
          onChange={(event) => setLastName(event.target.value)}
        />
      </div>
      <button
        type="submit"
        className="button button--primary"
        data-testid="lookup-submit"
        disabled={disabled}
      >
        Найти
      </button>
    </form>
  );
};
