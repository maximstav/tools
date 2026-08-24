import type { KeyboardEvent } from 'react';
import { useMemo, useState } from 'react';

export interface MultiComboboxFieldOption {
  label: string;
  value: string;
}

export interface MultiComboboxFieldProps {
  data?: MultiComboboxFieldOption[];
  value?: string;
  placeholder?: string;
  multiple?: boolean;
  clearable?: boolean;
  onChange?: (value: string) => void;
}

const SEPARATOR = ',';

const parseValues = (value?: string) =>
  (value ?? '')
    .split(SEPARATOR)
    .map(item => item.trim())
    .filter(Boolean);

export const useMultiComboboxField = ({
  data = [],
  value,
  placeholder,
  multiple = true,
  onChange,
}: MultiComboboxFieldProps) => {
  const [inputValue, setInputValue] = useState('');

  const selectedValues = useMemo(() => parseValues(value), [value]);

  const displayData = useMemo(() => {
    const knownValues = new Set(data.map(option => option.value));
    const customOptions = selectedValues
      .filter(selectedValue => !knownValues.has(selectedValue))
      .map(selectedValue => ({ label: selectedValue, value: selectedValue }));

    const allOptions = [...data, ...customOptions];

    // Group items to satisfy Requirement 3: selected items appear at the top
    const selectedOptions = allOptions.filter(opt => selectedValues.includes(opt.value));
    const unselectedOptions = allOptions.filter(opt => !selectedValues.includes(opt.value));

    return [...selectedOptions, ...unselectedOptions];
  }, [data, selectedValues]);

  const computedPlaceholder = useMemo(() => {
    if (selectedValues.length === 0) return placeholder;

    // Requirement 2: Show actual selected labels for 3 or fewer items
    if (selectedValues.length <= 3) {
      return selectedValues
        .map(val => {
          const option = data.find(opt => opt.value === val);
          return option ? option.label : val; // Fallback to raw value for custom options
        })
        .join(', ');
    }

    return `${selectedValues.length} selected`;
  }, [selectedValues, placeholder, data]);

  const setSelectedValues = (nextValues: string[]) => {
    onChange?.(nextValues.join(SEPARATOR));
    setInputValue('');
  };

  const addValue = (newValue: string) => {
    const trimmedValue = newValue.trim();

    if (!trimmedValue || selectedValues.includes(trimmedValue)) {
      setInputValue('');
      return;
    }

    setSelectedValues(multiple ? [...selectedValues, trimmedValue] : [trimmedValue]);
  };

  const toggleValue = (targetValue: string) => {
    const isSelected = selectedValues.includes(targetValue);

    let nextValues: string[];

    if (isSelected) {
      nextValues = selectedValues.filter(item => item !== targetValue);
    } else if (multiple) {
      nextValues = [...selectedValues, targetValue];
    } else {
      nextValues = [targetValue];
    }

    setSelectedValues(nextValues);
  };

  const handleInput = (event: Event) => {
    const target = event.target as HTMLElement & { value: string };
    setInputValue(target.value);
  };

  const handleSelectOption = (option: MultiComboboxFieldOption) => {
    toggleValue(option.value);
  };

  const handleKeyDownCapture = (event: KeyboardEvent) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    addValue(inputValue);
  };

  return {
    inputValue,
    selectedValues,
    displayData,
    computedPlaceholder,
    handleInput,
    handleSelectOption,
    handleKeyDownCapture,
  };
};
