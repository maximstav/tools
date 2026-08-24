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
  } = useMultiComboboxField(props);

  // Ref to access the AutocompleteGroup's shadow root for the spacing fix
  const groupRef = useRef<HTMLElement>(null);

  // Effect to manually hide the empty label-container inside the shadow DOM
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
      >
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
