Here is a clear, professional task description you can copy and paste directly into your issue board (like Jira, GitHub Issues, or Trello). It covers all the architectural changes and security updates we discussed.

### Title: Configure Multiple DB Connection Pools (HikariCP) & Secure Credentials

**Background**
Currently, our Spring Boot backend connects to a single database with credentials hardcoded in the `application.properties` file. We need to prepare our architecture to support three physically distinct databases. This requires moving away from Spring's default auto-configuration to manually configure three HikariCP connection pools, while simultaneously securing our database credentials via environment variables.

**Acceptance Criteria**

* **Secure Secrets:** Hardcoded usernames and passwords must be removed from `application.properties` and replaced with environment variable placeholders (e.g., `${DB1_USERNAME}`).
* **Local Environment Setup:** Implement a `.env` file for local development and ensure it is immediately added to `.gitignore`.
* **HikariCP Configuration:** Define unique properties for three databases (`db1`, `db2`, `db3`) in `application.properties`, including JDBC URLs and tuned Hikari settings (e.g., `maximum-pool-size=10`).
* **Package Restructuring:** Organize existing and future Entity and Repository classes into dedicated database-specific folders (e.g., `com.app.db1`, `com.app.db2`).
* **Java Configuration:** Create three distinct `@Configuration` classes (`Db1Config`, `Db2Config`, `Db3Config`) to explicitly define the `DataSource`, `EntityManagerFactory`, and `TransactionManager` for each database.
* **Primary Designation:** Ensure Database 1's configuration beans are annotated with `@Primary` so Spring knows which connection to use by default.

**Technical Notes**

* **Stack:** Spring Boot, Spring Data JPA, HikariCP, Gradle.
* **Security check:** Verify that no `.env` files or credentials are accidentally committed during the Pull Request review.

---

This structure makes it incredibly clear to any developer (or future you!) exactly what needs to be done, why it matters, and how to verify it is complete.

Which project management tool are you using to track this project?
