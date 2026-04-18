package com.voyexa.backend.repositories;

import com.voyexa.backend.entities.TravelerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TravelerProfileRepository extends JpaRepository<TravelerProfile, Long> {

    @Query("SELECT tp FROM TravelerProfile tp WHERE tp.user.user_id = :userId ORDER BY tp.createdAt DESC")
    List<TravelerProfile> findByUserId(@Param("userId") Integer userId);

    @Query("SELECT tp FROM TravelerProfile tp WHERE tp.user.user_id = :userId AND tp.id IN :profileIds")
    List<TravelerProfile> findByUserIdAndIds(@Param("userId") Integer userId, @Param("profileIds") List<Long> profileIds);
}
