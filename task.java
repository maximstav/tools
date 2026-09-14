import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@SpringBootTest
@AutoConfigureRestTestClient 
@ActiveProfiles("integration-test")
class FilterConfigurationControllerIT {

    private static final String ENDPOINT = "/api/database/filters/orders";

    @Autowired
    private RestTestClient restTestClient;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @BeforeEach
    void setUpMockJwt() {
        when(jwtDecoder.decode(anyString())).thenReturn(
                Jwt.withTokenValue("mock-token")
                        .header("alg", "none")
                        .claim("sub", "test-user")
                        .build()
        );
    }

    @Test
    void getSearchFiltersForPageReturnsOrdersFilterConfiguration() {
        restTestClient.get()
                .uri(ENDPOINT)
                .header("Authorization", "Bearer mock-token")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.filters['ownerGroup']").exists()
                .jsonPath("$.filters['ownerGroup'].type").isEqualTo("dropdown")
                .jsonPath("$.filters['ownerGroup'].props.placeholder").isEqualTo("Select Owner Group")
                .jsonPath("$.defaultFilters[0]").isEqualTo("reutersCode")
                .jsonPath("$.defaultFilters[1]").isEqualTo("creationTime")
                .jsonPath("$.defaultFilters[2]").isEqualTo("orderQty");
    }

    @Test
    void getSearchFiltersForPageReturnsNotFoundForUnknownPage() {
        restTestClient.get()
                .uri("/api/database/filters/unknown-page-does-not-exist")
                .header("Authorization", "Bearer mock-token")
                .exchange()
                .expectStatus().isNotFound();
    }
}
