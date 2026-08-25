import './multi-combobox-field.css';
import { useRef, useEffect, useId, useState } from 'react';

import { Autocomplete, AutocompleteGroup, AutocompleteItem, AutocompleteList, Icon, Tooltip } from '@ds-components';

import type { MultiComboboxFieldProps, MultiComboboxFieldOption } from './use-multi-combobox-field';
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
    handleClear,
  } = useMultiComboboxField(props);

  const uniqueId = useId().replace(/:/g, '');
  const autocompleteId = `autocomplete-${uniqueId}`;

  const groupRef = useRef<HTMLElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // --- Effects ---
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
  }, [inputValue]);


  // --- Event Handlers ---
  const handleWrapperFocus = () => setIsDropdownOpen(true);

  const handleWrapperBlur = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDropdownOpen(false);
    }
  };

  const handleWrapperKeyDown = (e: React.KeyboardEvent) => {
    handleKeyDownCapture(e);
    if (e.key === 'Escape') setIsDropdownOpen(false);
  };

  const handleClearClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleClear();
  };

  const handleItemClick = (e: React.MouseEvent, option: MultiComboboxFieldOption) => {
    e.preventDefault();
    e.stopPropagation();
    handleSelectOption(option);
  };

  const handleItemKeyDown = (e: React.KeyboardEvent, option: MultiComboboxFieldOption) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      handleSelectOption(option);
    }
  };


  // --- Render Helpers ---
  const renderItems = () =>
    displayData.map((option) => (
      <AutocompleteItem
        key={option.value}
        label={option.label}
        onMouseDownCapture={(e: React.MouseEvent) => e.preventDefault()}
        onClickCapture={(e: React.MouseEvent) => handleItemClick(e, option)}
        onKeyDownCapture={(e: React.KeyboardEvent) => handleItemKeyDown(e, option)}
      >
        {selectedValues.includes(option.value) && <Icon slot="end" name="status_check" />}
      </AutocompleteItem>
    ));

  return (
    <>
      <div 
        className="multi-combobox-field" 
        onKeyDownCapture={handleWrapperKeyDown}
        onFocusCapture={handleWrapperFocus}
        onBlurCapture={handleWrapperBlur}
      >
        <Autocomplete
          id={autocompleteId} 
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
              className="multi-combobox-clear-icon"
              onMouseDownCapture={handleClearClick}
            />
          )}

          <AutocompleteList>
            {!inputValue ? (
              <AutocompleteGroup ref={groupRef} initial>
                {renderItems()}
              </AutocompleteGroup>
            ) : (
              <AutocompleteGroup ref={groupRef}>
                {renderItems()}
              </AutocompleteGroup>
            )}
          </AutocompleteList>
        </Autocomplete>
      </div>

      {selectedValues.length > 3 && !isDropdownOpen && (
        <Tooltip for={autocompleteId} placement="bottom-start">
          <div className="multi-combobox-tooltip-content">
            {allSelectedLabels}
          </div>
        </Tooltip>
      )}
    </>
  );
};




/* Existing shadow-root fixes (if you added any previously) */
/* ... */

/* New classes for cleaner JSX */
.multi-combobox-clear-icon {
  cursor: pointer;
  z-index: 10;
}

.multi-combobox-tooltip-content {
  max-width: 300px;
  white-space: normal;
  word-wrap: break-word;
  text-align: left;
}
