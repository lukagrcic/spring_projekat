package rs.fon.bg.ac.hotel_server_application.service.impl;

import org.indigo.dtomapper.providers.specification.Mapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import rs.fon.bg.ac.hotel_server_application.domain.Employee;
import rs.fon.bg.ac.hotel_server_application.domain.Guest;
import rs.fon.bg.ac.hotel_server_application.domain.Reservation;
import rs.fon.bg.ac.hotel_server_application.domain.Room;
import rs.fon.bg.ac.hotel_server_application.domain.dto.request.ReservationRequest;
import rs.fon.bg.ac.hotel_server_application.domain.dto.response.ReservationResponse;
import rs.fon.bg.ac.hotel_server_application.repository.EmployeeRepository;
import rs.fon.bg.ac.hotel_server_application.repository.GuestRepository;
import rs.fon.bg.ac.hotel_server_application.repository.ReservationRepository;
import rs.fon.bg.ac.hotel_server_application.repository.RoomRepository;
import rs.fon.bg.ac.hotel_server_application.service.ReservationService;
import rs.fon.bg.ac.hotel_server_application.util.DateUtil;

import java.util.ArrayList;
import java.util.List;

@Service
public class ReservationServiceImpl implements ReservationService {

    @Autowired
    private Mapper mapper;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private GuestRepository guestRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Override
    public List<ReservationResponse> findAll() {
        List<ReservationResponse> responses = new ArrayList<>();
        for (Reservation reservation : reservationRepository.findAll()) {
            responses.add(mapper.map(reservation, ReservationResponse.class));
        }
        return responses;
    }

    @Override
    public List<ReservationResponse> search(String query) {

        List<Reservation> reservations = reservationRepository.search(query);
        List<ReservationResponse> responses = new ArrayList<>();

        for (Reservation reservation : reservations) {
            responses.add(mapper.map(reservation, ReservationResponse.class));
        }

        return responses;
    }

    @Override
    public ReservationResponse findById(long id) {
        Reservation reservation = reservationRepository.findById(id).orElse(null);
        if(reservation == null) {
            return null;
        }
        ReservationResponse response = mapper.map(reservation, ReservationResponse.class);

        long numberOfDays = DateUtil.getDatesBetweenTwoDates(reservation.getDateFrom(), reservation.getDateTo());
        response.setTotalPrice(reservation.getRoom().getRoomType().getPricePerNight() * numberOfDays);

        return response;
    }

    @Override
    public ReservationResponse save(ReservationRequest reservationRequest) {
        Reservation reservation = mapper.map(reservationRequest, Reservation.class);
        Guest guest = guestRepository.findById(reservationRequest.getGuestId());
        Employee employee = employeeRepository.findById(reservationRequest.getEmployeeId()).orElse(null);
        Room room = roomRepository.findById(reservationRequest.getRoomId()).orElse(null);

        reservation.setGuest(guest);
        reservation.setEmployee(employee);
        reservation.setRoom(room);

        reservationRepository.save(reservation);
        return mapper.map(reservation, ReservationResponse.class);
    }

    @Override
    public void update(ReservationRequest reservationRequest) {

        Reservation reservation = reservationRepository.findById(reservationRequest.getId()).orElse(null);
        if(reservation == null) {
            return;
        }

        reservation.setDateFrom(reservationRequest.getDateFrom());
        reservation.setDateTo(reservationRequest.getDateTo());
        reservation.setStatus(reservationRequest.getStatus());
        reservation.setBreakfastIncluded(reservationRequest.isBreakfastIncluded());
        reservation.setNote(reservationRequest.getNote());

        if(!(reservation.getEmployee().getId().equals(reservationRequest.getEmployeeId()))) {
            Employee employee = employeeRepository.findById(reservationRequest.getEmployeeId()).orElse(null);
            reservation.setEmployee(employee);
        }

        if(!(reservation.getRoom().getRoomId().equals(reservationRequest.getRoomId()))) {
            Room room = roomRepository.findById(reservationRequest.getRoomId()).orElse(null);
            reservation.setRoom(room);
        }

        if(!(reservation.getGuest().getId().equals(reservationRequest.getGuestId()))) {
            Guest guest = guestRepository.findById(String.valueOf(reservationRequest.getGuestId())).orElse(null);
            reservation.setGuest(guest);
        }

        reservationRepository.save(reservation);
    }

    @Override
    public void delete(long id) {

        reservationRepository.deleteById(id);
    }
}
