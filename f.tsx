import './multi-combobox-field.css';
import { useRef, useEffect, useId } from 'react'; // <-- Added useId

// Added Tooltip to imports
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
    allSelectedLabels, // <-- Extracted here
    handleInput,
    handleSelectOption,
    handleKeyDownCapture,
    handleClear,
  } = useMultiComboboxField(props);

  // 1. Generate unique ID for the tooltip to target
  const uniqueId = useId().replace(/:/g, '');
  const autocompleteId = `autocomplete-${uniqueId}`;

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
    <>
      <div className="multi-combobox-field" onKeyDownCapture={handleKeyDownCapture}>
        <Autocomplete
          id={autocompleteId} // <-- 2. Attach ID here
          value={inputValue}
          placeholder={computedPlaceholder}
          clearable={clearable}
          highlightMatches={true}
          onInput={handleInput}
          onClear={handleClear}
        >
          {clearable && selectedValues.length > 0 && !inputValue && (
            <Icon
              slot="end"
              name="close" 
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

      {/* 3. Show Tooltip if more than 3 items are selected */}
      {selectedValues.length > 3 && (
        <Tooltip for={autocompleteId} placement="bottom-start">
          {allSelectedLabels}
        </Tooltip>
      )}
    </>
  );
};
