# Spring Boot 双数据源配置指南

## 概述

本项目演示了如何在 Spring Boot 中配置双数据源，并以 **Starter 模块化** 方式实现按需加载：
- **PostgreSQL** (主数据源) - 使用 Spring Data JPA
- **Oracle** (次数据源，只读) - 使用 MyBatis

## 项目结构

```
DoubleDatasourceTest/
├── pom.xml                                    # 父 POM (多模块管理)
├── datasource-oracle-mybatis-starter/         # Oracle + MyBatis Starter
│   ├── pom.xml
│   └── src/main/java/.../config/
│       └── OracleMyBatisAutoConfiguration.java
├── datasource-postgres-jpa-starter/           # PostgreSQL + JPA Starter
│   ├── pom.xml
│   └── src/main/java/.../config/
│       └── PostgresJpaAutoConfiguration.java
└── app/                                       # 主应用模块
    ├── pom.xml
    └── src/main/java/.../
        ├── config/
        │   ├── OracleMapperScanConfig.java    # 条件 Mapper 扫描
        │   └── PostgresJpaRepositoryConfig.java # 条件 JPA Repository 扫描
        ├── jpa/entity/                        # JPA 实体
        ├── jpa/repository/                    # JPA Repository
        ├── mybatis/mapper/                    # MyBatis Mapper
        ├── mybatis/model/                     # MyBatis 模型
        └── DoubleDatasourceTestApplication.java
```

## 核心思想

### 1. Starter 自动配置 + 条件加载

**问题**: 引入 Starter 依赖但未配置数据源时，应用启动会失败。

**解决方案**: 使用 `@ConditionalOnProperty` 确保只有配置存在时才创建 Bean。

```
引入依赖 → 检查配置是否存在 → 存在则创建 Bean → 不存在则跳过
```

### 2. 数据源隔离架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      Spring Boot Application                     │
├─────────────────────────────────┬───────────────────────────────┤
│        PostgreSQL + JPA         │     Oracle + MyBatis (只读)    │
├─────────────────────────────────┼───────────────────────────────┤
│  postgresDataSource             │  oracleDataSource              │
│         ↓                       │         ↓                      │
│  postgresEntityManagerFactory   │  oracleSqlSessionFactory       │
│         ↓                       │         ↓                      │
│  postgresTransactionManager     │  (无需事务管理器 - 只读)        │
│         ↓                       │         ↓                      │
│  ProductRepository              │  OracleUserMapper              │
│  (jpa.repository)               │  (mybatis.mapper)              │
└─────────────────────────────────┴───────────────────────────────┘
```

### 3. 关键 Bean 名称

| 组件 | PostgreSQL (JPA) | Oracle (MyBatis) |
|------|------------------|------------------|
| 配置前缀 | `spring.datasource.postgres` | `spring.datasource.oracle` |
| 数据源 Bean | `postgresDataSource` | `oracleDataSource` |
| 会话工厂 | `postgresEntityManagerFactory` | `oracleSqlSessionFactory` |
| 会话模板 | - | `oracleSqlSessionTemplate` |
| 事务管理器 | `postgresTransactionManager` | 无 (只读模式) |

## 实现详解

### 1. Oracle MyBatis Starter

**自动配置类** (`OracleMyBatisAutoConfiguration.java`):

```java
@AutoConfiguration
@ConditionalOnClass({SqlSessionFactory.class, SqlSessionFactoryBean.class})
@ConditionalOnProperty(
        prefix = "spring.datasource.oracle",
        name = "jdbc-url"  // 只有配置存在时才加载
)
public class OracleMyBatisAutoConfiguration {

    @Bean(name = "oracleDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.oracle")
    @ConditionalOnMissingBean(name = "oracleDataSource")
    public DataSource oracleDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "oracleSqlSessionFactory")
    @ConditionalOnMissingBean(name = "oracleSqlSessionFactory")
    public SqlSessionFactory oracleSqlSessionFactory(
            @Qualifier("oracleDataSource") DataSource dataSource) throws Exception {
        SqlSessionFactoryBean factory = new SqlSessionFactoryBean();
        factory.setDataSource(dataSource);
        // ... 配置 mapper locations, type aliases 等
        return factory.getObject();
    }

    @Bean(name = "oracleSqlSessionTemplate")
    @ConditionalOnMissingBean(name = "oracleSqlSessionTemplate")
    public SqlSessionTemplate oracleSqlSessionTemplate(
            @Qualifier("oracleSqlSessionFactory") SqlSessionFactory factory) {
        return new SqlSessionTemplate(factory);
    }
}
```

**注册自动配置** (`META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`):

```
com.hsbc.starter.oracle.config.OracleMyBatisAutoConfiguration
```

### 2. PostgreSQL JPA Starter

**自动配置类** (`PostgresJpaAutoConfiguration.java`):

```java
@AutoConfiguration
@ConditionalOnClass({LocalContainerEntityManagerFactoryBean.class})
@ConditionalOnProperty(
        prefix = "spring.datasource.postgres",
        name = "jdbc-url"  // 只有配置存在时才加载
)
@EnableTransactionManagement
public class PostgresJpaAutoConfiguration {

    @Bean(name = "postgresDataSource")
    @Primary
    @ConfigurationProperties(prefix = "spring.datasource.postgres")
    @ConditionalOnMissingBean(name = "postgresDataSource")
    public DataSource postgresDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "postgresEntityManagerFactory")
    @Primary
    @ConditionalOnMissingBean(name = "postgresEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean postgresEntityManagerFactory(...) {
        // ... 创建 EntityManagerFactory
    }

    @Bean(name = "postgresTransactionManager")
    @Primary
    @ConditionalOnMissingBean(name = "postgresTransactionManager")
    public PlatformTransactionManager postgresTransactionManager(...) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}
```

### 3. 应用模块条件扫描配置

**为什么需要条件扫描?**

`@MapperScan` 和 `@EnableJpaRepositories` 需要引用 Starter 中的 Bean。如果 Starter 未配置（Bean 不存在），直接使用这些注解会导致启动失败。

**解决方案**: 使用 `@ConditionalOnProperty` 创建条件配置类

```java
// OracleMapperScanConfig.java
@Configuration
@ConditionalOnProperty(prefix = "spring.datasource.oracle", name = "jdbc-url")
@MapperScan(
        basePackages = {"com.hsbc.doubledatasourcetest.mybatis.mapper"},
        sqlSessionTemplateRef = "oracleSqlSessionTemplate"
)
public class OracleMapperScanConfig {
}

// PostgresJpaRepositoryConfig.java
@Configuration
@ConditionalOnProperty(prefix = "spring.datasource.postgres", name = "jdbc-url")
@EnableJpaRepositories(
        basePackages = {"com.hsbc.doubledatasourcetest.jpa.repository"},
        entityManagerFactoryRef = "postgresEntityManagerFactory",
        transactionManagerRef = "postgresTransactionManager"
)
public class PostgresJpaRepositoryConfig {
}
```

**注意**: 只需要 `@ConditionalOnProperty`，不需要 `@ConditionalOnBean`。当配置属性存在时，Starter 会自动创建对应的 Bean。

### 4. 配置文件 (application.yaml)

```yaml
spring:
  datasource:
    # PostgreSQL 数据源配置 - 注释掉则不加载 JPA
    postgres:
      driver-class-name: org.postgresql.Driver
      jdbc-url: jdbc:postgresql://localhost:5432/postgres
      username: ${POSTGRES_USER:postgresdocker}
      password: ${POSTGRES_PASSWORD:postgresdocker}
      hikari:
        maximum-pool-size: 10
        minimum-idle: 2

    # Oracle 数据源配置 - 注释掉则不加载 MyBatis
    oracle:
      driver-class-name: oracle.jdbc.OracleDriver
      jdbc-url: jdbc:oracle:thin:@//127.0.0.1:1521/XEPDB1
      username: ${ORACLE_USER:app_user}
      password: ${ORACLE_PASSWORD:AppUser123456}
      hikari:
        maximum-pool-size: 10
        minimum-idle: 2
        read-only: true  # Oracle 只读模式

  jpa:
    entity-scan-base-packages: com.hsbc.doubledatasourcetest.jpa.entity,com.hsbc.doubledatasourcetest.jpa1.entity
    hibernate:
      ddl-auto: none
    open-in-view: false

mybatis:
  configuration:
    map-underscore-to-camel-case: true
  mapper-locations:
    - classpath:mappers/*.xml
  type-aliases-package: com.hsbc.doubledatasourcetest.mybatis.model
```

## 使用方式

### 场景 1: 同时使用两个数据源

在 `app/pom.xml` 中引入两个 Starter:

```xml
<dependency>
    <groupId>com.hsbc</groupId>
    <artifactId>datasource-oracle-mybatis-starter</artifactId>
</dependency>
<dependency>
    <groupId>com.hsbc</groupId>
    <artifactId>datasource-postgres-jpa-starter</artifactId>
</dependency>
```

配置两个数据源的 `jdbc-url`，两个都会加载。

### 场景 2: 只使用 PostgreSQL

同样引入两个 Starter，但只配置 PostgreSQL:

```yaml
spring:
  datasource:
    postgres:
      jdbc-url: jdbc:postgresql://localhost:5432/postgres
      # ... 其他配置
    # oracle:  ← 不配置或注释掉
```

Oracle Starter 会被跳过，不会报错。

### 场景 3: 只使用 Oracle

```yaml
spring:
  datasource:
    # postgres:  ← 不配置或注释掉
    oracle:
      jdbc-url: jdbc:oracle:thin:@//127.0.0.1:1521/XEPDB1
      # ... 其他配置
```

PostgreSQL Starter 会被跳过。

## 关键注解说明

| 注解 | 作用 |
|------|------|
| `@AutoConfiguration` | Spring Boot 3.x 自动配置类标记 |
| `@ConditionalOnProperty` | 配置属性存在时才加载 (核心条件注解) |
| `@ConditionalOnClass` | 类路径存在时才加载 |
| `@ConditionalOnMissingBean` | Bean 不存在时才创建 (允许用户覆盖) |
| `@Primary` | 标记为默认 Bean |
| `@Qualifier` | 指定 Bean 名称 |

## 事务管理

```java
@Service
public class TestService {

    // 使用 PostgreSQL 事务管理器
    @Transactional(transactionManager = "postgresTransactionManager")
    public void saveProduct(Product product) {
        productRepository.save(product);
    }

    // Oracle 只读，无需事务
    public OracleUser getOracleUser(Long id) {
        return oracleUserMapper.selectById(id);
    }
}
```

## 常见问题

### Q1: 引入 Starter 但未配置，启动失败?

**检查点**:
1. 确保配置类使用了 `@ConditionalOnProperty`
2. 确保扫描配置类也使用了条件注解
3. 检查是否遗漏了条件注解

### Q2: Bean 注入失败 "No qualifying bean"?

**可能原因**:
1. 配置前缀写错 (例如 `spring.datasource.oracle` vs `spring.datasource.oracle.jdbc-url`)
2. Bean 名称不匹配
3. 条件不满足导致 Bean 未创建

### Q3: 如何覆盖 Starter 中的默认 Bean?

在应用模块中定义同名 Bean，Starter 使用了 `@ConditionalOnMissingBean`，会自动跳过。

## 版本信息

- Spring Boot: 4.1.0-M1
- MyBatis Spring Boot Starter: 4.0.0
- Java: 25
