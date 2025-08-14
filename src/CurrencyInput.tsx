import { useState, useEffect } from "react";

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const CurrencyInput = ({
  value,
  onChange,
  placeholder,
  className,
}: CurrencyInputProps) => {
  const [displayValue, setDisplayValue] = useState("");

  // Format number with commas
  const formatNumber = (num: string): string => {
    // Remove all non-digit characters except decimal point
    const cleanNum = num.replace(/[^\d.]/g, "");

    // Handle decimal point - only allow one
    const parts = cleanNum.split(".");
    if (parts.length > 2) {
      return displayValue; // Don't update if multiple decimal points
    }

    // Format the integer part with commas
    if (parts[0]) {
      const integerPart = parseInt(parts[0]).toLocaleString();
      const decimalPart = parts[1] !== undefined ? `.${parts[1]}` : "";
      return `${integerPart}${decimalPart}`;
    }

    return cleanNum;
  };

  // Remove commas to get raw number
  const getRawValue = (formatted: string): string => {
    return formatted.replace(/,/g, "");
  };

  useEffect(() => {
    if (value === "") {
      setDisplayValue("");
    } else {
      setDisplayValue(formatNumber(value));
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatNumber(inputValue);
    const raw = getRawValue(formatted);

    setDisplayValue(formatted);
    onChange(raw);
  };

  const handleBlur = () => {
    // Clean up the display on blur
    if (displayValue && !isNaN(parseFloat(getRawValue(displayValue)))) {
      const num = parseFloat(getRawValue(displayValue));
      setDisplayValue(num.toLocaleString());
      onChange(num.toString());
    }
  };

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
    />
  );
};
