package com.hsbc.starter.postgres.config;

import jakarta.persistence.EntityManagerFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.hibernate.autoconfigure.HibernateProperties;
import org.springframework.boot.hibernate.autoconfigure.HibernateSettings;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.jpa.EntityManagerFactoryBuilder;
import org.springframework.boot.jpa.autoconfigure.JpaProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;
import java.util.Map;

/**
 * PostgreSQL + JPA Auto Configuration
 * <p>
 * This configuration is only loaded when:
 * 1. JPA classes are on the classpath
 * 2. spring.datasource.postgres.jdbc-url is configured
 * <p>
 * If the property is not configured, this entire configuration is skipped.
 */
@Slf4j
@AutoConfiguration
@ConditionalOnClass({LocalContainerEntityManagerFactoryBean.class, EntityManagerFactory.class})
@ConditionalOnProperty(
        prefix = "spring.datasource.postgres",
        name = "jdbc-url"
)
@EnableTransactionManagement
@RequiredArgsConstructor
public class PostgresJpaAutoConfiguration {

    private final JpaProperties jpaProperties;

    private final HibernateProperties hibernateProperties;

    @Value("${spring.jpa.entity-scan-base-packages:}")
    private String[] entityScanPackages;

    /**
     * Create PostgreSQL DataSource Bean (Primary)
     */
    @Bean(name = "postgresDataSource")
    @Primary
    @ConfigurationProperties(prefix = "spring.datasource.postgres")
    @ConditionalOnMissingBean(name = "postgresDataSource")
    public DataSource postgresDataSource() {
        log.info("[PostgreSQL Starter] Creating PostgreSQL DataSource (Primary)...");
        return DataSourceBuilder.create().build();
    }

    /**
     * Create JPA EntityManagerFactory for PostgreSQL
     */
    @Bean(name = "postgresEntityManagerFactory")
    @Primary
    @ConditionalOnMissingBean(name = "postgresEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean postgresEntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("postgresDataSource") DataSource postgresDataSource) {
        log.info("[PostgreSQL Starter] Creating EntityManagerFactory...");

        Map<String, Object> hibernateSettings = hibernateProperties.determineHibernateProperties(
                jpaProperties.getProperties(),
                new HibernateSettings()
        );

        String[] packages = (entityScanPackages != null && entityScanPackages.length > 0)
                ? entityScanPackages
                : new String[]{"com.hsbc"};  // Default fallback

        LocalContainerEntityManagerFactoryBean emf = builder
                .dataSource(postgresDataSource)
                .packages(packages)
                .persistenceUnit("postgresPersistenceUnit")
                .properties(hibernateSettings)
                .build();

        log.info("[PostgreSQL Starter] EntityManagerFactory created successfully");
        return emf;
    }

    /**
     * Create JPA TransactionManager for PostgreSQL
     */
    @Bean(name = "postgresTransactionManager")
    @Primary
    @ConditionalOnMissingBean(name = "postgresTransactionManager")
    public PlatformTransactionManager postgresTransactionManager(
            @Qualifier("postgresEntityManagerFactory") EntityManagerFactory entityManagerFactory) {
        log.info("[PostgreSQL Starter] Creating TransactionManager...");
        return new JpaTransactionManager(entityManagerFactory);
    }
}
