import './multi-combobox-field.css';
import { useRef, useEffect, useId, useState } from 'react'; // <-- Added useState

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
  
  // NEW: Track if the dropdown is currently open (focused)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
      <div 
        className="multi-combobox-field" 
        onKeyDownCapture={(e) => {
          handleKeyDownCapture(e);
          // Optional: Close state if they press Escape to dismiss the menu
          if (e.key === 'Escape') setIsDropdownOpen(false);
        }}
        // Track focus to hide the tooltip when the user is actively interacting
        onFocusCapture={() => setIsDropdownOpen(true)}
        onBlurCapture={(e) => {
          // Only close if they are actually clicking outside of the component entirely
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

      {/* Conditionally hide the tooltip if the dropdown is open */}
      {selectedValues.length > 3 && !isDropdownOpen && (
        <Tooltip for={autocompleteId} placement="bottom-start">
          {/* Wrapper to force the tooltip text to span multiple lines */}
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
