import './multi-combobox-field.css';
import { useId } from 'react'; // <-- Import useId

// Import Tooltip from your library
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
    allSelectedLabels, 
    handleInput,
    handleSelectOption,
    handleKeyDownCapture,
  } = useMultiComboboxField(props);

  // Generate a unique, DOM-safe ID for this specific component instance
  const uniqueId = useId().replace(/:/g, ''); 
  const triggerId = `combobox-wrapper-${uniqueId}`;

  return (
    <>
      <div 
        id={triggerId} // <-- Attach the ID here
        className="multi-combobox-field" 
        onKeyDownCapture={handleKeyDownCapture}
      >
        <Autocomplete
          value={inputValue}
          placeholder={computedPlaceholder}
          clearable={clearable}
          highlightMatches={true}
          onInput={handleInput}
        >
          <AutocompleteList>
            <AutocompleteGroup initial className="no-header-group">
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

      {/* Render the library Tooltip only if more than 3 items are selected */}
      {selectedValues.length > 3 && (
        <Tooltip for={triggerId} placement="bottom-start">
          {allSelectedLabels}
        </Tooltip>
      )}
    </>
  );
};
