FROM maven:3.9-eclipse-temurin-17

WORKDIR /app

COPY . .

# Build from repo root where pom.xml is /app/backend/backend/pom.xml.
RUN mvn -f /app/backend/backend/pom.xml clean package -DskipTests

CMD ["sh", "-c", "java -jar /app/backend/backend/target/*.jar"]