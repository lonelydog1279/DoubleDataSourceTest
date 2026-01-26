package com.hsbc.doubledatasourcetest.controller;


import com.hsbc.doubledatasourcetest.jpa.entity.Product;
import com.hsbc.doubledatasourcetest.mybatis.model.OracleUser;
import com.hsbc.doubledatasourcetest.service.TestService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TestController {

    private final TestService testService;

    @GetMapping("/test")
    public List<OracleUser> test() {
        return testService.getAllOracleUsers();
    }


    @GetMapping("/products")
    public List<Product> products() {
        return testService.getAllProducts();
    }

    @PostMapping("/test1")
    public void test2(@RequestBody Product product) {
        testService.addProduct(product);
    }

    @GetMapping("/testA")
    public void testAnnotationQuery() {
        testService.testAnnotationSelect();
    }
}
