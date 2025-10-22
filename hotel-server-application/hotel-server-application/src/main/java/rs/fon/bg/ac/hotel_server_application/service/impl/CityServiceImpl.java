package rs.fon.bg.ac.hotel_server_application.service.impl;

import org.indigo.dtomapper.providers.specification.Mapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import rs.fon.bg.ac.hotel_server_application.domain.City;
import rs.fon.bg.ac.hotel_server_application.domain.dto.response.CityResponse;
import rs.fon.bg.ac.hotel_server_application.repository.CityRepository;
import rs.fon.bg.ac.hotel_server_application.service.CityService;

import java.util.ArrayList;
import java.util.List;

@Service
public class CityServiceImpl implements CityService {

    @Autowired
    private Mapper mapper;

    @Autowired
    private CityRepository cityRepository;

    @Override
    public List<CityResponse> findAll() {

        List<City> cities = cityRepository.findAll();
        List<CityResponse> cityResponses = new ArrayList<>();

        for (City city : cities) {
            cityResponses.add(mapper.map(city, CityResponse.class));
        }

        return cityResponses;
    }

    @Override
    public List<CityResponse> search(String query) {
        List<City> cities = cityRepository.search(query);
        List<CityResponse> cityResponses = new ArrayList<>();

        for (City city : cities) {
            cityResponses.add(mapper.map(city, CityResponse.class));
        }

        return cityResponses;
    }

}
