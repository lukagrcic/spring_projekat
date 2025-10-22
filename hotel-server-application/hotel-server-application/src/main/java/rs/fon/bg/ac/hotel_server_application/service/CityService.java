package rs.fon.bg.ac.hotel_server_application.service;

import rs.fon.bg.ac.hotel_server_application.domain.dto.response.CityResponse;

import java.util.List;

public interface CityService {

    List<CityResponse> findAll();

    List<CityResponse> search(String query);

}
