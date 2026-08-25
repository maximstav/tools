import './multi-combobox-field.css';
import { useRef, useEffect } from 'react';

import { Autocomplete, AutocompleteGroup, AutocompleteItem, AutocompleteList, Icon } from '@ds-components';

import type { MultiComboboxFieldProps } from './use-multi-combobox-field';
import { useMultiComboboxField } from './use-multi-combobox-field';

export const MultiComboboxField = (props: MultiComboboxFieldProps) => {
  const { clearable = true } = props;
  const {
    inputValue,
    selectedValues,
    displayData,
    computedPlaceholder,
    handleInput,
    handleSelectOption,
    handleKeyDownCapture,
    handleClear, // <-- Extracted here
  } = useMultiComboboxField(props);

  const groupRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const hideEmptyHeader = () => {
      if (groupRef.current && groupRef.current.shadowRoot) {
        const labelContainer = groupRef.current.shadowRoot.querySelector('#label-container');
        if (labelContainer) {
          (labelContainer as HTMLElement).style.display = 'none';
        }
      }
    };

    hideEmptyHeader();
    const timeout = setTimeout(hideEmptyHeader, 50);
    
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="multi-combobox-field" onKeyDownCapture={handleKeyDownCapture}>
      <Autocomplete
        value={inputValue}
        placeholder={computedPlaceholder}
        clearable={clearable}
        highlightMatches={true}
        onInput={handleInput}
        onClear={handleClear} // <-- 1. Catches the built-in clear event if the user is typing
      >
        {/* 2. Forces a clear icon to appear when items are selected but the text input is empty */}
        {clearable && selectedValues.length > 0 && !inputValue && (
          <Icon
            slot="end"
            name="close" /* NOTE: You might need to change this to "clear" or "x" depending on your design system's icon names */
            onMouseDownCapture={(e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              handleClear();
            }}
            style={{ cursor: 'pointer', zIndex: 10 }}
          />
        )}

        <AutocompleteList>
          <AutocompleteGroup 
            ref={groupRef} 
            initial 
          >
            {displayData.map(option => (
              <AutocompleteItem
                key={option.value}
                label={option.label}
                onMouseDownCapture={(e: React.MouseEvent) => {
                  e.preventDefault();
                }}
                onClickCapture={(e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectOption(option);
                }}
                onKeyDownCapture={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectOption(option);
                  }
                }}
              >
                {selectedValues.includes(option.value) && <Icon slot="end" name="status_check" />}
              </AutocompleteItem>
            ))}
          </AutocompleteGroup>
        </AutocompleteList>
      </Autocomplete>
    </div>
  );
};
