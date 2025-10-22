package rs.fon.bg.ac.hotel_server_application.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rs.fon.bg.ac.hotel_server_application.domain.dto.request.LoginRequest;
import rs.fon.bg.ac.hotel_server_application.domain.dto.response.LoginResponse;
import rs.fon.bg.ac.hotel_server_application.service.EmployeeService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private EmployeeService employeeService;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest loginRequest) {
        return employeeService.login(loginRequest);
    }

}
