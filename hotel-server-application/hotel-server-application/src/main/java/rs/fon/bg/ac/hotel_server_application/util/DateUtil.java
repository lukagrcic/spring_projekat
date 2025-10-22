package rs.fon.bg.ac.hotel_server_application.util;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;

public class DateUtil {

    public static long getDatesBetweenTwoDates(Date startDate, Date endDate) {
        LocalDate localStartDate = startDate.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();

        LocalDate localEndDate = endDate.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();

        return ChronoUnit.DAYS.between(localStartDate, localEndDate);
    }

}
