package com.hsbc.doubledatasourcetest.mybatis.mapper;


import com.hsbc.doubledatasourcetest.mybatis.model.OracleUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * Oracle MyBatis Mapper Interface (Persistent Layer)
 */
public interface OracleUserMapper {

    /**
     * Query Oracle user by ID
     * @param id User ID
     * @return OracleUser
     */
    OracleUser selectById(@Param("id") Long id);

    /**
     * Query all Oracle users
     * @return List<OracleUser>
     */
    List<OracleUser> selectAll();

    @Select("SELECT ID, USER_NAME, AGE FROM T_ORACLE_USER WHERE ID = #{id}")
    OracleUser selectById1(@Param("id") Long id);
}
