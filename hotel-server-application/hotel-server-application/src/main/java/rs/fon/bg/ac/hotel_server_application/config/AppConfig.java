package rs.fon.bg.ac.hotel_server_application.config;

import org.indigo.dtomapper.providers.MapperFactory;
import org.indigo.dtomapper.providers.specification.Mapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class AppConfig {

    @Bean
    public Mapper getMapper() {
        return MapperFactory.getMapper();
    }

}