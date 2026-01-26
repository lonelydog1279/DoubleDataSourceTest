package com.hsbc.doubledatasourcetest;

import org.mybatis.spring.boot.autoconfigure.MybatisAutoConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Application
 * <p>
 * Datasource configurations are auto-loaded from starters:
 * - datasource-oracle-mybatis-starter: Only loads if spring.datasource.oracle.jdbc-url is configured
 * - datasource-postgres-jpa-starter: Only loads if spring.datasource.postgres.jdbc-url is configured
 * <p>
 * Note: MybatisAutoConfiguration is excluded to prevent default SqlSessionFactory
 * from binding to the primary (PostgreSQL) datasource.
 */
@SpringBootApplication
public class DoubleDatasourceTestApplication {

    public static void main(String[] args) {
        SpringApplication.run(DoubleDatasourceTestApplication.class, args);
    }
}
