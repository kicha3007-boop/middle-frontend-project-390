import type { Passenger } from "../../api/types";
import { Field } from "../../components/Field";
import {
  type BookingFormErrors,
  type PassengerField,
  passengerErrorKey,
  passengerFields,
  passengerTestIdSuffix,
} from "./bookingFormModel";

interface PassengerFieldsProps {
  index: number;
  passenger: Passenger;
  errors: BookingFormErrors;
  onChange: (index: number, field: PassengerField, value: string) => void;
  onRemove?: (index: number) => void;
}

// Поля одного пассажира; форма рисует их для каждого элемента массива пассажиров.
export const PassengerFields = ({
  index,
  passenger,
  errors,
  onChange,
  onRemove,
}: PassengerFieldsProps) => (
  <fieldset className="passenger">
    <legend>Пассажир {index + 1}</legend>
    <div className="grid">
      {passengerFields.map(({ name, label, type }) => (
        <Field
          key={name}
          id={`passenger-${index}-${name}`}
          testId={`passenger-${index}-${passengerTestIdSuffix[name]}`}
          label={label}
          type={type}
          value={passenger[name]}
          error={errors[passengerErrorKey(index, name)]}
          onChange={(event) => onChange(index, name, event.target.value)}
        />
      ))}
    </div>
    {onRemove && (
      <button type="button" className="button button--link" onClick={() => onRemove(index)}>
        Удалить пассажира
      </button>
    )}
  </fieldset>
);
