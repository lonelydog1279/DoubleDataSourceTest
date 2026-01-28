package com.hsbc.starter.oracle.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.session.Configuration;
import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.boot.autoconfigure.MybatisProperties;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.Resource;

import javax.sql.DataSource;

/**
 * Oracle + MyBatis Auto Configuration (Read-only mode)
 * <p>
 * This configuration is only loaded when:
 * 1. MyBatis classes are on the classpath
 * 2. spring.datasource.oracle.jdbc-url is configured
 * <p>
 * If the property is not configured, this entire configuration is skipped.
 */
@Slf4j
@AutoConfiguration
@ConditionalOnClass({SqlSessionFactory.class, SqlSessionFactoryBean.class})
@ConditionalOnProperty(
        prefix = "spring.datasource.oracle",
        name = "jdbc-url"
)
@EnableConfigurationProperties(MybatisProperties.class)
@RequiredArgsConstructor
public class OracleMyBatisAutoConfiguration {

    private final MybatisProperties mybatisProperties;

    /**
     * Create Oracle DataSource Bean (Read-only)
     */
    @Bean(name = "oracleDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.oracle")
    @ConditionalOnMissingBean(name = "oracleDataSource")
    public DataSource oracleDataSource() {
        log.info("[Oracle Starter] Creating Oracle DataSource (Read-only mode)...");
        return DataSourceBuilder.create().build();
    }

    /**
     * Create MyBatis SqlSessionFactory for Oracle
     */
    @Bean(name = "oracleSqlSessionFactory")
    @ConditionalOnMissingBean(name = "oracleSqlSessionFactory")
    public SqlSessionFactory oracleSqlSessionFactory(
            @Qualifier("oracleDataSource") DataSource oracleDataSource) throws Exception {
        log.info("[Oracle Starter] Creating SqlSessionFactory...");

        SqlSessionFactoryBean factory = new SqlSessionFactoryBean();
        factory.setDataSource(oracleDataSource);

        Resource[] mapperLocations = mybatisProperties.resolveMapperLocations();
        if (mapperLocations != null && mapperLocations.length > 0) {
            factory.setMapperLocations(mapperLocations);
        }
        if (mybatisProperties.getTypeAliasesPackage() != null) {
            factory.setTypeAliasesPackage(mybatisProperties.getTypeAliasesPackage());
        }
        if (mybatisProperties.getConfiguration() != null) {
            Configuration configuration = new Configuration();
            mybatisProperties.getConfiguration().applyTo(configuration);
            factory.setConfiguration(configuration);
        }

        log.info("[Oracle Starter] SqlSessionFactory created successfully");
        return factory.getObject();
    }

    /**
     * Create MyBatis SqlSessionTemplate for Oracle
     */
    @Bean(name = "oracleSqlSessionTemplate")
    @ConditionalOnMissingBean(name = "oracleSqlSessionTemplate")
    public SqlSessionTemplate oracleSqlSessionTemplate(
            @Qualifier("oracleSqlSessionFactory") SqlSessionFactory sqlSessionFactory) {
        log.info("[Oracle Starter] Creating SqlSessionTemplate...");
        return new SqlSessionTemplate(sqlSessionFactory);
    }

}
