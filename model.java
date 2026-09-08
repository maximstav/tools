@ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ErrorResponse> handleMethodValidation(final HandlerMethodValidationException ex, final HttpServletRequest request) {
        final List<String> details = ex.getParameterValidationResults()
                .stream()
                .flatMap(this::extractValidationDetails)
                .toList();

        log.warn("Validation failed on {}: {}", request.getRequestURI(), details);
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "Validation failed", request, details);
    }

    private Stream<String> extractValidationDetails(final ParameterValidationResult result) {
        if (result instanceof ParameterErrors errors) {
            return errors.getAllErrors().stream().map(this::formatError);
        }

        return result.getResolvableErrors()
                .stream()
                .map(MessageSourceResolvable::getDefaultMessage);
    }

    private String formatError(final ObjectError error) {
        if (error instanceof FieldError fieldError) {
            return fieldError.getField() + ": " + fieldError.getDefaultMessage();
        }
        
        return error.getDefaultMessage();
    }
