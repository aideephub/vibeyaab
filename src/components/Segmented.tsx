import { useId } from 'react';

type Option<T extends string> = { value: T; label: string; lang?: string };

/** Accessible segmented control built on native radio inputs (arrow keys work out of the box). */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}) {
  const name = useId();
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <label key={option.value} className="segmented-option">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span lang={option.lang}>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
