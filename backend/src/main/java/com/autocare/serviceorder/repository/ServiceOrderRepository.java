package com.autocare.serviceorder.repository;

import com.autocare.serviceorder.entity.ServiceOrder;
import com.autocare.serviceorder.entity.ServiceOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ServiceOrderRepository extends JpaRepository<ServiceOrder, String> {

    List<ServiceOrder> findByClientId(String clientId);
    List<ServiceOrder> findByVehicleId(String vehicleId);
    List<ServiceOrder> findByMechanicId(String mechanicId);
    List<ServiceOrder> findByStatus(ServiceOrderStatus status);

    @Query("SELECT s FROM ServiceOrder s WHERE s.status IN :statuses")
    List<ServiceOrder> findByStatusIn(@Param("statuses") List<ServiceOrderStatus> statuses);

    @Query("SELECT s FROM ServiceOrder s WHERE s.createdAt BETWEEN :start AND :end")
    List<ServiceOrder> findByCreatedAtBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    boolean existsByOrderNumber(String orderNumber);
    ServiceOrder findByOrderNumber(String orderNumber);

    // Usa uma sequence do Postgres (criada na migration V5) em vez de "count() + 1":
    // count()+1 não é atômico, então duas OS criadas ao mesmo tempo podiam calcular o
    // mesmo próximo número. nextval() é garantido atômico pelo banco mesmo sob concorrência.
    @Query(value = "SELECT nextval('service_order_number_seq')", nativeQuery = true)
    Long nextOrderSequenceValue();
}