package rs.fon.bg.ac.hotel_server_application.service.impl;

import org.indigo.dtomapper.providers.specification.Mapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import rs.fon.bg.ac.hotel_server_application.domain.City;
import rs.fon.bg.ac.hotel_server_application.domain.Guest;
import rs.fon.bg.ac.hotel_server_application.domain.dto.request.GuestRequest;
import rs.fon.bg.ac.hotel_server_application.domain.dto.response.GuestResponse;
import rs.fon.bg.ac.hotel_server_application.repository.CityRepository;
import rs.fon.bg.ac.hotel_server_application.repository.GuestRepository;
import rs.fon.bg.ac.hotel_server_application.repository.ReservationRepository;
import rs.fon.bg.ac.hotel_server_application.service.GuestService;

import java.util.ArrayList;
import java.util.List;

@Service
public class GuestServiceImpl implements GuestService {

    @Autowired
    private Mapper mapper;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private GuestRepository guestRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Override
    public List<GuestResponse> findAll() {
        List<GuestResponse> responses = new ArrayList<>();
        for (Guest guest : guestRepository.findAll()) {
            responses.add(mapper.map(guest, GuestResponse.class));
        }
        return responses;
    }

    @Override
    public List<GuestResponse> search(String query) {
            List<Guest> guests = guestRepository.search(query);
        List<GuestResponse> responses = new ArrayList<>();
        for (Guest guest : guests) {
            responses.add(mapper.map(guest, GuestResponse.class));
        }
        return responses;
    }

    @Override
    public GuestResponse findById(Long id) {
        Guest guest = guestRepository.findById(id);
        GuestResponse response = mapper.map(guest, GuestResponse.class);

        return response;
    }

    @Override
    public GuestResponse save(GuestRequest guestRequest) {
        Guest guest = mapper.map(guestRequest, Guest.class);
        City city = cityRepository.findById(guestRequest.getCityId()).get();
        guest.setCity(city);

        guestRepository.save(guest);
        return mapper.map(guest, GuestResponse.class);
    }

    @Override
    public GuestResponse update(GuestRequest guestRequest) {

        Guest guest = guestRepository.findById(String.valueOf(guestRequest.getId())).orElse(null);
        if(guest == null) {
            return null;
        }

        guest.setFirstName(guestRequest.getFirstName());
        guest.setLastName(guestRequest.getLastName());
        guest.setEmail(guestRequest.getEmail());
        guest.setPhoneNumber(guestRequest.getPhoneNumber());

        if(!(guest.getCity().getCityId().equals(guestRequest.getCityId()))) {

            City city = cityRepository.findById(guestRequest.getCityId()).orElse(null);
            guest.setCity(city);
        }

        guestRepository.save(guest);
        return mapper.map(guest, GuestResponse.class);
    }

    @Override
    public void delete(Long id) {

        if(reservationRepository.existsByGuestId(id)) {
            throw new RuntimeException("Za navedenog gosta postoje rezervacije, nije moguce obrisati gosta.");
        }

        guestRepository.deleteById(String.valueOf(id));
    }

}
