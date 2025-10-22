package rs.fon.bg.ac.hotel_server_application.service;

import rs.fon.bg.ac.hotel_server_application.domain.dto.request.LoginRequest;
import rs.fon.bg.ac.hotel_server_application.domain.dto.response.LoginResponse;

public interface EmployeeService {

    LoginResponse login(LoginRequest loginRequest);

}
