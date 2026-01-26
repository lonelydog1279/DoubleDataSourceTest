package com.hsbc.doubledatasourcetest.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * JPA Repository Scan Configuration
 * <p>
 * Only activates when PostgreSQL datasource is configured (jdbc-url exists).
 */
@Configuration
@ConditionalOnProperty(prefix = "spring.datasource.postgres", name = "jdbc-url")
@EnableJpaRepositories(
        basePackages = {
                "com.hsbc.doubledatasourcetest.jpa.repository",
                "com.hsbc.doubledatasourcetest.jpa1.repository"
        },
        entityManagerFactoryRef = "postgresEntityManagerFactory",
        transactionManagerRef = "postgresTransactionManager"
)
public class PostgresJpaRepositoryConfig {
}
