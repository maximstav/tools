import './multi-combobox-field.css';

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
          <AutocompleteGroup initial className="no-header-group">
            {displayData.map(option => (
              <AutocompleteItem
                key={option.value}
                label={option.label}
                // 1. Prevent input focus loss
                onMouseDownCapture={(e: React.MouseEvent) => {
                  e.preventDefault(); 
                }}
                // 2. Intercept click before the component closes the menu
                onClickCapture={(e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectOption(option);
                }}
                // 3. Intercept keyboard Enter/Space selection
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
