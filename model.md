### 1. the Exception Handler

Modify `handleValidation` to use `getAllErrors()` instead of `getFieldErrors()`. This ensures both standard field annotations (like `@Min`) and custom class-level validators are captured.

```java
@ExceptionHandler(MethodArgumentNotValidException.class)
public ResponseEntity<ErrorResponse> handleValidation(final MethodArgumentNotValidException ex, final HttpServletRequest request) {
    final List<String> details = ex.getBindingResult()
            .getAllErrors()
            .stream()
            .map(error -> {
                if (error instanceof FieldError fieldError) {
                    return fieldError.getField() + ": " + fieldError.getDefaultMessage();
                }
                // Captures class-level errors from SearchRequestValidator
                return error.getDefaultMessage(); 
            })
            .toList();

    log.warn("Validation failed on {}: {}", request.getRequestURI(), details);
    return buildErrorResponse(HttpStatus.BAD_REQUEST, "Validation failed", request, details);
}

```

### 2. Attach Custom Errors to Specific Fields

Currently, `SearchRequestValidator` stops at the first error it finds (`.findFirst()`) and attaches it generically. To provide a better frontend experience, evaluate all filters and attach the errors directly to the specific index of the `filters` array.

Replace your `isValid` method with this loop:

```java
@Override
public boolean isValid(final SearchRequest searchRequest, final ConstraintValidatorContext context) {
    List<SearchCriteria> filters = (searchRequest != null && searchRequest.filters() != null) 
            ? searchRequest.filters() 
            : List.of();

    boolean isValid = true;
    
    // Disable the default class-level violation once
    context.disableDefaultConstraintViolation();

    for (int i = 0; i < filters.size(); i++) {
        SearchCriteria criteria = filters.get(i);
        if (criteria == null) continue;

        String errorMessage = validate(criteria);
        if (errorMessage != null) {
            isValid = false;
            
            // Bind the error exactly to filters[i] (e.g., "filters[0].key")
            context.buildConstraintViolationWithTemplate(errorMessage)
                   .addPropertyNode("filters")
                   .addPropertyNode("key") // or whichever field makes sense
                   .inIterable().atIndex(i)
                   .addConstraintViolation();
        }
    }

    return isValid;
}

```

With these two changes, if a user sends a bad date range in the second filter, your frontend will receive a specific message like `filters[1].key: Validation failed: filter 'createdAt' requires both 'from' and 'to' values.` in the `details` array, allowing it to highlight the exact input that needs fixing.
