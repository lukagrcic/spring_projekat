package rs.fon.bg.ac.hotel_server_application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import rs.fon.bg.ac.hotel_server_application.domain.Guest;

import java.util.List;

public interface GuestRepository extends JpaRepository<Guest, String> {

    Guest findById(Long id);

    @Query("from Guest g where g.firstName ilike ?1% or g.lastName ilike ?1% or g.phoneNumber ilike %?1% or g.jmbg ilike ?1% or g.city.cityName ilike ?1%")
    List<Guest> search(String query);

    void deleteById(Long id);

    @Query("from Guest g where g.city.cityName = ?1")
    List<Guest> customSearch(String query);

}
