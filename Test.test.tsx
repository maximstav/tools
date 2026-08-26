Title: Improve UX and Functionality of Multi-Combobox Field
User Story:
As a user interacting with multi-select filters, I want a more intuitive dropdown experience so that I can easily view, select, and clear multiple options without the dropdown closing prematurely or hiding my selections.
Acceptance Criteria:
 * Instant Visibility: The dropdown options must appear immediately when the input is focused/clicked (no typing required).
 * Smart Sorting:
   * Selected items must always appear at the top of the dropdown list.
   * When the user types, matching items must be sorted to the top of the list.
 * Dynamic Placeholder:
   * If 1 to 3 items are selected, the placeholder should display their names (e.g., "Option 1, Option 2").
   * If more than 3 items are selected, the placeholder should display a summary (e.g., "4 selected").
 * Tooltip on Hover: When more than 3 items are selected, hovering over the input must display a tooltip containing the full list of selected item names. The tooltip must hide if the dropdown menu is actively open.
 * Frictionless Selection: Clicking an item must select/deselect it without closing the dropdown menu or losing focus on the input field.
 * Custom Clear Action: A clear ("x") icon must be visible when items are selected but the text input is empty, allowing the user to clear all selections at once.
 * UI Polish: Remove the empty header spacing bug caused by the custom <AutocompleteGroup> shadow DOM.
Technical Notes:
 * Component uses @ds-components.
 * Uses capture-phase events (onClickCapture, onMouseDownCapture) to prevent the web component from auto-closing on selection.
 * Uses a useEffect and useRef to target and hide the #label-container inside the shadow DOM to fix the empty space glitch.
 * Conditionally renders the initial attribute on the autocomplete group to prevent the component from collapsing when filtering large datasets (500+ items).
🧪 Tests (Jest + React Testing Library)
Because your company uses custom Web Components (@ds-components), it is standard practice to mock them in Jest. JSDOM (the simulated browser Jest uses) doesn't always play nicely with Shadow DOMs and custom element lifecycles.
Create a file named multi-combobox-field.test.tsx next to your component:
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MultiComboboxField } from './multi-combobox-field';

// 1. Mock the custom Web Components so Jest can render them as simple HTML
jest.mock('@ds-components', () => ({
  Autocomplete: (props: any) => <div data-testid="autocomplete" {...props}>{props.children}</div>,
  AutocompleteGroup: React.forwardRef((props: any, ref: any) => (
    <div data-testid="autocomplete-group" ref={ref} {...props}>{props.children}</div>
  )),
  AutocompleteItem: (props: any) => (
    <div 
      data-testid="autocomplete-item" 
      onClickCapture={props.onClickCapture}
      onKeyDownCapture={props.onKeyDownCapture}
      {...props}
    >
      {props.children}
    </div>
  ),
  AutocompleteList: (props: any) => <div data-testid="autocomplete-list" {...props}>{props.children}</div>,
  Icon: (props: any) => <span data-testid={`icon-${props.name}`} {...props} />,
  Tooltip: (props: any) => <div data-testid="tooltip" {...props}>{props.children}</div>,
}));

describe('MultiComboboxField', () => {
  const mockData = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Cherry', value: 'cherry' },
    { label: 'Date', value: 'date' },
    { label: 'Elderberry', value: 'elderberry' },
  ];

  const defaultProps = {
    data: mockData,
    placeholder: 'Select fruits...',
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Test 1: Snapshot Test ---
  it('matches the snapshot', () => {
    const { asFragment } = render(<MultiComboboxField {...defaultProps} />);
    expect(asFragment()).toMatchSnapshot();
  });

  // --- Test 2: Placeholder formatting ---
  it('displays the default placeholder when empty', () => {
    render(<MultiComboboxField {...defaultProps} />);
    const autocomplete = screen.getByTestId('autocomplete');
    expect(autocomplete).toHaveAttribute('placeholder', 'Select fruits...');
  });

  it('displays exact labels in placeholder when 1-3 items are selected', () => {
    render(<MultiComboboxField {...defaultProps} value="apple, banana" />);
    const autocomplete = screen.getByTestId('autocomplete');
    expect(autocomplete).toHaveAttribute('placeholder', 'Apple, Banana');
  });

  it('displays "N selected" placeholder when more than 3 items are selected', () => {
    render(<MultiComboboxField {...defaultProps} value="apple, banana, cherry, date" />);
    const autocomplete = screen.getByTestId('autocomplete');
    expect(autocomplete).toHaveAttribute('placeholder', '4 selected');
  });

  // --- Test 3: Tooltip Rendering ---
  it('renders the tooltip with all selected labels when > 3 items are selected', () => {
    render(<MultiComboboxField {...defaultProps} value="apple, banana, cherry, date" />);
    const tooltip = screen.getByTestId('tooltip');
    
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Apple, Banana, Cherry, Date');
  });

  it('does not render tooltip when 3 or fewer items are selected', () => {
    render(<MultiComboboxField {...defaultProps} value="apple, banana, cherry" />);
    expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument();
  });

  // --- Test 4: Selection Interaction ---
  it('calls onChange with the newly selected value when an item is clicked', () => {
    render(<MultiComboboxField {...defaultProps} value="apple" />);
    
    // Find the Banana option and click it
    const bananaItem = screen.getByText('Banana').closest('[data-testid="autocomplete-item"]');
    fireEvent.click(bananaItem!);

    // Should return the original selected item + the new one
    expect(defaultProps.onChange).toHaveBeenCalledWith('apple,banana');
  });

  // --- Test 5: Clear Functionality ---
  it('renders a custom clear icon when items are selected and fires onChange with empty string', () => {
    render(<MultiComboboxField {...defaultProps} value="apple, banana" clearable={true} />);
    
    const clearIcon = screen.getByTestId('icon-close');
    expect(clearIcon).toBeInTheDocument();

    fireEvent.mouseDown(clearIcon);
    expect(defaultProps.onChange).toHaveBeenCalledWith('');
  });
});


