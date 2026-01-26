package com.hsbc.doubledatasourcetest.jpa.repository;

import com.hsbc.doubledatasourcetest.jpa.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("select p from Product p where p.id = :id")
    Product findById1(@Param("id")Long id);

}
