package rs.fon.bg.ac.hotel_server_application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import rs.fon.bg.ac.hotel_server_application.domain.Room;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {

    @Query("from Room r where r.roomNumber ilike %?1% or r.roomType.pricePerNight <= cast(?1 as double)")
    List<Room> search(String query);

}
