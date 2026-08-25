import './multi-combobox-field.css';
import { useRef, useEffect, useId, useState } from 'react';

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
    handleClear,
  } = useMultiComboboxField(props);

  const uniqueId = useId().replace(/:/g, '');
  const autocompleteId = `autocomplete-${uniqueId}`;

  const groupRef = useRef<HTMLElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // This effect runs every time inputValue changes, ensuring the spacing fix 
  // is applied to whichever group is currently rendered.
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

  // Helper function to render items so we don't duplicate this large block of code
  const renderItems = () => {
    return displayData.map(option => (
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
    ));
  };

  return (
    <>
      <div 
        className="multi-combobox-field" 
        onKeyDownCapture={(e) => {
          handleKeyDownCapture(e);
          if (e.key === 'Escape') setIsDropdownOpen(false);
        }}
        onFocusCapture={() => setIsDropdownOpen(true)}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDropdownOpen(false);
          }
        }}
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
              onMouseDownCapture={(e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                handleClear();
              }}
              style={{ cursor: 'pointer', zIndex: 10 }}
            />
          )}

          <AutocompleteList>
            {/* THE FIX: Conditionally swap the entire group based on user input */}
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
          <div style={{ 
            maxWidth: '300px', 
            whiteSpace: 'normal', 
            wordWrap: 'break-word',
            textAlign: 'left'
          }}>
            {allSelectedLabels}
          </div>
        </Tooltip>
      )}
    </>
  );
};

