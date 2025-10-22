package rs.fon.bg.ac.hotel_server_application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import rs.fon.bg.ac.hotel_server_application.domain.City;

import java.util.List;

public interface CityRepository extends JpaRepository<City,Long> {

    City findByCityName(String cityName);

    @Query("from City c where c.cityName ilike ?1%")
    List<City> search(String query);

    // @Query("from City c where c.cityName ilike %?1%")
    List<City> findByCityNameContaining(String cityName);

    // @Query("from City c where c.cityName ilike ?1%")
    List<City> findByCityNameStartingWith(String cityName);

}
