package com.hsbc.doubledatasourcetest.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;

/**
 * MyBatis Mapper Scan Configuration
 * <p>
 * Only activates when Oracle datasource is configured (jdbc-url exists).
 */
@Configuration
@ConditionalOnProperty(prefix = "spring.datasource.oracle", name = "jdbc-url")
@MapperScan(
        basePackages = {"com.hsbc.doubledatasourcetest.mybatis.mapper"},
        sqlSessionTemplateRef = "oracleSqlSessionTemplate"
)
public class OracleMapperScanConfig {
}
