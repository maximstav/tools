package com.lseg.supportportal.backend.core.search.deserializer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.lseg.supportportal.backend.core.search.domain.DateRangeValue;
import com.lseg.supportportal.backend.core.search.domain.NumericRangeValue;
import com.lseg.supportportal.backend.core.search.domain.SearchCriteria;
import com.lseg.supportportal.backend.core.search.domain.SearchOperator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SearchCriteriaDeserializerTest {

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        // Required to deserialize LocalDate instances in the payload records
        objectMapper.registerModule(new JavaTimeModule()); 
    }

    @Test
    void shouldDeserializeEqualOperator() throws JsonProcessingException {
        // Given
        String json = """
            {
                "key": "name",
                "operator": "EQUAL",
                "value": "John Doe"
            }
            """;

        // When
        SearchCriteria result = objectMapper.readValue(json, SearchCriteria.class);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.key()).isEqualTo("name");
        assertThat(result.operator()).isEqualTo(SearchOperator.EQUAL);
        assertThat(result.value()).isEqualTo("John Doe");
    }

    @Test
    void shouldDeserializeNumericBetweenOperator() throws JsonProcessingException {
        // Given
        String json = """
            {
                "key": "price",
                "operator": "BETWEEN",
                "value": {
                    "from": 10.5,
                    "to": 50.75
                }
            }
            """;

        // When
        SearchCriteria result = objectMapper.readValue(json, SearchCriteria.class);

        // Then
        assertThat(result.key()).isEqualTo("price");
        assertThat(result.operator()).isEqualTo(SearchOperator.BETWEEN);
        assertThat(result.value()).isInstanceOf(NumericRangeValue.class);

        NumericRangeValue numericRange = (NumericRangeValue) result.value();
        assertThat(numericRange.fromInclusive()).isEqualTo(new BigDecimal("10.5"));
        assertThat(numericRange.toInclusive()).isEqualTo(new BigDecimal("50.75"));
    }

    @Test
    void shouldDeserializeDateBetweenOperator() throws JsonProcessingException {
        // Given
        String json = """
            {
                "key": "createdDate",
                "operator": "BETWEEN",
                "value": {
                    "from": "2023-10-01",
                    "to": "2023-10-15"
                }
            }
            """;

        // When
        SearchCriteria result = objectMapper.readValue(json, SearchCriteria.class);

        // Then
        assertThat(result.key()).isEqualTo("createdDate");
        assertThat(result.operator()).isEqualTo(SearchOperator.BETWEEN);
        assertThat(result.value()).isInstanceOf(DateRangeValue.class);

        DateRangeValue dateRange = (DateRangeValue) result.value();
        assertThat(dateRange.fromInclusive()).isEqualTo(LocalDateTime.of(2023, 10, 1, 0, 0));
        // Verify that 'to' date was shifted to the next day's start time as per deserializer logic
        assertThat(dateRange.toExclusive()).isEqualTo(LocalDateTime.of(2023, 10, 16, 0, 0)); 
    }

    @Test
    void shouldThrowWhenBetweenOperatorMissesFromOrTo() {
        // Given
        String jsonMissesTo = """
            {
                "key": "price",
                "operator": "BETWEEN",
                "value": {
                    "from": 10.5
                }
            }
            """;

        // When & Then
        assertThatThrownBy(() -> objectMapper.readValue(jsonMissesTo, SearchCriteria.class))
                .isInstanceOf(JsonMappingException.class)
                .hasRootCauseInstanceOf(InvalidSearchCriteriaException.class)
                .hasMessageContaining("BETWEEN operator requires both 'from' and 'to' values");
    }
    
    @Test
    void shouldThrowWhenDateBetweenOperatorHasNullDates() {
        // Given
        String jsonNullDates = """
            {
                "key": "date",
                "operator": "BETWEEN",
                "value": {
                    "from": null,
                    "to": null
                }
            }
            """;

        // When & Then
        assertThatThrownBy(() -> objectMapper.readValue(jsonNullDates, SearchCriteria.class))
                .isInstanceOf(JsonMappingException.class)
                .hasRootCauseInstanceOf(InvalidSearchCriteriaException.class)
                .hasMessageContaining("BETWEEN operator requires both 'from' and 'to' values");
    }

    @Test
    void shouldDeserializeInOperator() throws JsonProcessingException {
        // Given
        String json = """
            {
                "key": "status",
                "operator": "IN",
                "value": {
                    "values": ["ACTIVE", "PENDING", "RESOLVED"]
                }
            }
            """;

        // When
        SearchCriteria result = objectMapper.readValue(json, SearchCriteria.class);

        // Then
        assertThat(result.key()).isEqualTo("status");
        assertThat(result.operator()).isEqualTo(SearchOperator.IN);
        
        @SuppressWarnings("unchecked")
        List<String> values = (List<String>) result.value();
        assertThat(values).containsExactly("ACTIVE", "PENDING", "RESOLVED");
    }

    @Test
    void shouldThrowWhenInOperatorMissesValuesArray() {
        // Given
        String jsonMissingValues = """
            {
                "key": "status",
                "operator": "IN",
                "value": {
                    "wrongKey": ["ACTIVE"]
                }
            }
            """;

        // When & Then
        assertThatThrownBy(() -> objectMapper.readValue(jsonMissingValues, SearchCriteria.class))
                .isInstanceOf(JsonMappingException.class)
                .hasRootCauseInstanceOf(InvalidSearchCriteriaException.class)
                .hasMessageContaining("IN operator requires a 'values' array");
    }

    @Test
    void shouldThrowWhenInOperatorValuesArrayIsEmpty() {
        // Given
        String jsonEmptyValues = """
            {
                "key": "status",
                "operator": "IN",
                "value": {
                    "values": []
                }
            }
            """;

        // When & Then
        assertThatThrownBy(() -> objectMapper.readValue(jsonEmptyValues, SearchCriteria.class))
                .isInstanceOf(JsonMappingException.class)
                .hasRootCauseInstanceOf(InvalidSearchCriteriaException.class)
                .hasMessageContaining("IN operator requires at least one selected value");
    }
}
