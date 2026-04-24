FROM maven:3.9-eclipse-temurin-17

WORKDIR /app

COPY . .

# Handle both repo-root and backend-only build contexts.
RUN if [ -f /app/pom.xml ]; then mvn -f /app/pom.xml clean package -DskipTests; else mvn -f /app/backend/backend/pom.xml clean package -DskipTests; fi

CMD ["sh", "-c", "if ls /app/target/*.jar >/dev/null 2>&1; then java -jar /app/target/*.jar; else java -jar /app/backend/backend/target/*.jar; fi"]