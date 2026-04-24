FROM maven:3.9-eclipse-temurin-17

WORKDIR /app

COPY . .

WORKDIR /app/backend/backend

RUN mvn clean package -DskipTests

CMD ["sh", "-c", "java -jar target/*.jar"]