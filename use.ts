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
    const lowerInput = inputValue.toLowerCase().trim();

    // If the user hasn't typed anything, just sort by Selected -> Unselected
    if (!lowerInput) {
      const selectedOptions = allOptions.filter(opt => selectedValues.includes(opt.value));
      const unselectedOptions = allOptions.filter(opt => !selectedValues.includes(opt.value));
      return [...selectedOptions, ...unselectedOptions];
    }

    // NEW: If the user IS typing, sort matches to the top
    const matchedSelected: MultiComboboxFieldOption[] = [];
    const matchedUnselected: MultiComboboxFieldOption[] = [];
    const unmatchedSelected: MultiComboboxFieldOption[] = [];
    const unmatchedUnselected: MultiComboboxFieldOption[] = [];

    allOptions.forEach(opt => {
      const isMatch = opt.label.toLowerCase().includes(lowerInput);
      const isSelected = selectedValues.includes(opt.value);

      if (isMatch && isSelected) matchedSelected.push(opt);
      else if (isMatch && !isSelected) matchedUnselected.push(opt);
      else if (!isMatch && isSelected) unmatchedSelected.push(opt);
      else unmatchedUnselected.push(opt);
    });

    // Order: Matched (selected first), then Unmatched (selected first)
    return [...matchedSelected, ...matchedUnselected, ...unmatchedSelected, ...unmatchedUnselected];
  }, [data, selectedValues, inputValue]); // <-- Added inputValue to dependencies

  const computedPlaceholder = useMemo(() => {
    if (selectedValues.length === 0) return placeholder;

    if (selectedValues.length <= 3) {
      return selectedValues
        .map(val => {
          const option = data.find(opt => opt.value === val);
          return option ? option.label : val; 
        })
        .join(', ');
    }

    return `${selectedValues.length} selected`;
  }, [selectedValues, placeholder, data]);

  const allSelectedLabels = useMemo(() => {
    if (selectedValues.length === 0) return '';
    
    return selectedValues
      .map(val => {
        const option = data.find(opt => opt.value === val);
        return option ? option.label : val;
      })
      .join(', ');
  }, [selectedValues, data]);

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

  const handleClear = () => {
    setSelectedValues([]);
    setInputValue('');
  };

  return {
    inputValue,
    selectedValues,
    displayData,
    computedPlaceholder,
    allSelectedLabels,
    handleInput,
    handleSelectOption,
    handleKeyDownCapture,
    handleClear,
  };
};
