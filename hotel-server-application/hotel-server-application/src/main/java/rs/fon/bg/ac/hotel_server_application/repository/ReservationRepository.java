package rs.fon.bg.ac.hotel_server_application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import rs.fon.bg.ac.hotel_server_application.domain.Reservation;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    @Query("from Reservation r where cast(r.id as string) ilike ?1% or r.guest.firstName ilike ?1% or r.guest.lastName ilike ?1% or r.room.roomNumber ilike ?1%")
    List<Reservation> search(String query);

    // CAST(r.id AS string) LIKE %?1% OR

    boolean existsByGuestId(Long id);

}
