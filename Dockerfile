# Stage 1 - Build
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Optimize by copying only pom.xml and mvn wrapper first
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Make wrapper executable and download dependencies for offline use
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

# Copy the rest of the application
COPY src ./src

# Build the jar
RUN ./mvnw clean package -DskipTests

# Stage 2 - Runtime
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy the compiled jar from the build stage
# Usually Spring Boot builds into target/mylibrary-*.jar
COPY --from=build /app/target/*.jar app.jar

# Expose the application port (optional but good practice)
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]