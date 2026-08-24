import './multi-combobox-field.css';
import { useId, useRef, useEffect } from 'react';

import { Autocomplete, AutocompleteGroup, AutocompleteItem, AutocompleteList, Icon, Tooltip } from '@ds-components';

import type { MultiComboboxFieldProps } from './use-multi-combobox-field';
import { useMultiComboboxField } from './use-multi-combobox-field';

export const MultiComboboxField = (props: MultiComboboxFieldProps) => {
  const { clearable = true } = props;
  const {
    inputValue,
    selectedValues,
    displayData,
    computedPlaceholder,
    allSelectedLabels, // <-- Make sure this is exported from use-multi-combobox-field.ts!
    handleInput,
    handleSelectOption,
    handleKeyDownCapture,
  } = useMultiComboboxField(props);

  // 1. Unique ID for the Tooltip targeting
  const uniqueId = useId().replace(/:/g, '');
  const autocompleteId = `autocomplete-${uniqueId}`;

  // 2. Ref to access the AutocompleteGroup's shadow root
  const groupRef = useRef<HTMLElement>(null);

  // 3. Effect to manually hide the empty label-container inside the shadow DOM
  useEffect(() => {
    // Wait for the component to mount and its shadow root to be created
    const hideEmptyHeader = () => {
      if (groupRef.current && groupRef.current.shadowRoot) {
        const labelContainer = groupRef.current.shadowRoot.querySelector('#label-container');
        if (labelContainer) {
          (labelContainer as HTMLElement).style.display = 'none';
        }
      }
    };

    // Run it immediately, and also set a tiny timeout just in case 
    // the web component takes an extra millisecond to paint its shadow DOM
    hideEmptyHeader();
    const timeout = setTimeout(hideEmptyHeader, 50);
    
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <div className="multi-combobox-field" onKeyDownCapture={handleKeyDownCapture}>
        <Autocomplete
          id={autocompleteId} // <-- Moved ID directly to the autocomplete component
          value={inputValue}
          placeholder={computedPlaceholder}
          clearable={clearable}
          highlightMatches={true}
          onInput={handleInput}
        >
          <AutocompleteList>
            <AutocompleteGroup 
              ref={groupRef} // <-- Attached the ref here to access the shadow DOM
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

      {/* Tooltip will now attach to the Autocomplete element itself */}
      {selectedValues.length > 3 && (
        <Tooltip for={autocompleteId} placement="bottom-start">
          {allSelectedLabels}
        </Tooltip>
      )}
    </>
  );
};
