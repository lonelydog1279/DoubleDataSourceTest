package com.hsbc.doubledatasourcetest.service;

import com.hsbc.doubledatasourcetest.jpa.entity.Product;
import com.hsbc.doubledatasourcetest.jpa.repository.ProductRepository;
import com.hsbc.doubledatasourcetest.mybatis.mapper.OracleUserMapper;
import com.hsbc.doubledatasourcetest.mybatis.model.OracleUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

/**
 * Business Service Layer (Native Configuration, No Impact on Business Logic)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TestService {


    private final OracleUserMapper oracleUserMapper;


    private final ProductRepository productRepository;


    // ==== Oracle Operations (Read-only, Graceful fault tolerance) ====
    public OracleUser getOracleUserById(Long id) {
        log.info("[Business Operation] Start querying Oracle user by ID: {}", id);
        if (oracleUserMapper == null) {
            log.warn("[Business Operation] Oracle datasource is not enabled, cannot execute query operation");
            return null;
        }
        if (id == null || id <= 0) {
            log.error("[Business Operation] Failed to query Oracle user, invalid ID: {}", id);
            throw new IllegalArgumentException("User ID is invalid, must be greater than 0");
        }
        try {
            OracleUser oracleUser = oracleUserMapper.selectById(id);
            if (oracleUser == null) {
                log.warn("[Business Operation] Oracle user not found by ID: {}", id);
            } else {
                log.info("[Business Operation] Oracle user queried successfully by ID: {}, Username: {}", id, oracleUser.getUserName());
            }
            return oracleUser;
        } catch (Exception e) {
            log.error("[Business Operation] Failed to query Oracle user by ID: {}", id, e);
            throw new RuntimeException("Failed to query Oracle user: " + e.getMessage(), e);
        }
    }

    public List<OracleUser> getAllOracleUsers() {
        log.info("[Business Operation] Start querying all Oracle users");
        if (oracleUserMapper == null) {
            log.warn("[Business Operation] Oracle datasource is not enabled, cannot execute query operation");
            return Collections.emptyList();
        }
        try {
            List<OracleUser> oracleUsers = oracleUserMapper.selectAll();
            log.info("[Business Operation] All Oracle users queried successfully, total records: {}", oracleUsers.size());
            return oracleUsers;
        } catch (Exception e) {
            log.error("[Business Operation] Failed to query all Oracle users", e);
            throw new RuntimeException("Failed to query all Oracle users: " + e.getMessage(), e);
        }
    }


    public List<Product> getAllProducts() {
        log.info("[Business Operation] Start querying all products");
        return productRepository.findAll();
    }

    @Transactional(rollbackFor = Exception.class)
    public void addProduct(Product product) {
        log.info("[Business Operation] Start adding product: {}", product);
//        productRepository.save(product);

        oracleUserMapper.selectAll();

//        productRepository.deleteById(3L);

//        productRepository.save(product);

    }

    public void testAnnotationSelect() {
//        Product p = productRepository.findById1(1L);
//        log.info("[Business Operation] Start testAnnotationSelect, product : {}", p);

        OracleUser oracleUser = oracleUserMapper.selectById1(1L);
        log.info("[Business Operation] Start testAnnotationSelect, oracle user: {}", oracleUser);
    }
}
