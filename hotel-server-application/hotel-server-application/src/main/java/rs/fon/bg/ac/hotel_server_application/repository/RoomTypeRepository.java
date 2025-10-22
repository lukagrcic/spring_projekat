package rs.fon.bg.ac.hotel_server_application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rs.fon.bg.ac.hotel_server_application.domain.RoomType;

public interface RoomTypeRepository extends JpaRepository<RoomType, Long> {

    RoomType findByCategory(String category);

}
