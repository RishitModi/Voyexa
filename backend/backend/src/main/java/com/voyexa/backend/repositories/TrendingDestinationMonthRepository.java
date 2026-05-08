package com.voyexa.backend.repositories;

import com.voyexa.backend.entities.TrendingDestinationMonth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface TrendingDestinationMonthRepository extends JpaRepository<TrendingDestinationMonth, Long> {

    @Query("SELECT t FROM TrendingDestinationMonth t WHERE t.month = :month ORDER BY t.rank ASC")
    List<TrendingDestinationMonth> findByMonthOrderByRank(@Param("month") String month);

    @Query("SELECT DISTINCT t.month FROM TrendingDestinationMonth t ORDER BY t.month ASC")
    List<String> findAllMonths();

    @Modifying
    @Transactional
    @Query("DELETE FROM TrendingDestinationMonth t WHERE t.month = :month")
    void deleteByMonth(@Param("month") String month);

    boolean existsByMonth(String month);
}

