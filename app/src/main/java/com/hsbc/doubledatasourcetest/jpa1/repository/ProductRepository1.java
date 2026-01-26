package com.hsbc.doubledatasourcetest.jpa1.repository;

import com.hsbc.doubledatasourcetest.jpa1.entity.Product1;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository1 extends JpaRepository<Product1, Long> {

}
