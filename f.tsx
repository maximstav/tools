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
          {/* Requirement 1: The 'initial' prop renders this group immediately on click/focus */}
          <AutocompleteGroup initial>
            {displayData.map(option => (
              <AutocompleteItem key={option.value} label={option.label} onSelect={() => handleSelectOption(option)}>
                {selectedValues.includes(option.value) && <Icon slot="end" name="status_check" />}
              </AutocompleteItem>
            ))}
          </AutocompleteGroup>
        </AutocompleteList>
      </Autocomplete>
    </div>
  );
};
