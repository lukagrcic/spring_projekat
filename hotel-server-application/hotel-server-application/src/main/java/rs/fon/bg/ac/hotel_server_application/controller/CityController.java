package rs.fon.bg.ac.hotel_server_application.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import rs.fon.bg.ac.hotel_server_application.domain.dto.response.CityResponse;
import rs.fon.bg.ac.hotel_server_application.service.CityService;

import java.util.List;

@RestController
@RequestMapping("/cities")
public class CityController {

    @Autowired
    private CityService cityService;

    @GetMapping("/findAll")
    public List<CityResponse> findAll() {
        return cityService.findAll();
    }

    @GetMapping("/search")
    public List<CityResponse> search(@RequestParam String query) {
        return cityService.search(query);
    }

}
