package rs.fon.bg.ac.hotel_server_application.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.util.Lazy;
import rs.fon.bg.ac.hotel_server_application.domain.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Employee findByFirstName(String firstName);

    Employee findByUsernameAndPassword(String username, String password);

    Employee findById(long id);
}
