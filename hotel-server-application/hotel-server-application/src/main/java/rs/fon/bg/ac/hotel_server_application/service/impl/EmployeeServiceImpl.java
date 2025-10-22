package rs.fon.bg.ac.hotel_server_application.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import rs.fon.bg.ac.hotel_server_application.domain.Employee;
import rs.fon.bg.ac.hotel_server_application.domain.dto.request.LoginRequest;
import rs.fon.bg.ac.hotel_server_application.domain.dto.response.LoginResponse;
import rs.fon.bg.ac.hotel_server_application.repository.EmployeeRepository;
import rs.fon.bg.ac.hotel_server_application.service.EmployeeService;

@Service
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public LoginResponse login(LoginRequest loginRequest) {

        Employee employee = employeeRepository.findByUsernameAndPassword(loginRequest.getUsername(), loginRequest.getPassword());

        if(employee != null) {
            return new LoginResponse(String.valueOf(employee.getId()), employee.getUsername(), employee.getUsername());
        }

        return null;
    }

}
