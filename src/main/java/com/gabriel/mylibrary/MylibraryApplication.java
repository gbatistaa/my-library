package com.gabriel.mylibrary;

import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.server.context.WebServerApplicationContext;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.context.annotation.Bean;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

@SpringBootApplication
public class MylibraryApplication {

	public static void main(String[] args) {
		SpringApplication.run(MylibraryApplication.class, args);
	}

	@Bean
	ApplicationRunner runner(WebApplicationContext context) {
		return args -> {
			if (context instanceof WebServerApplicationContext webServerContext) {
				int port = webServerContext.getWebServer().getPort();
				System.out.println("Server running on port: " + port);
			}
			System.out.println("Context Path: " + context.getServletContext().getContextPath());
		};
	}

	@PostConstruct
	public void JustBorn() {
		System.out.println("I am just born");
	}

	@PreDestroy
	public void AboutToDie() {
		System.out.println("I am about to die");
	}
}
