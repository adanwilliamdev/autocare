FROM openjdk:21-slim

WORKDIR /app

# Instalar maven
RUN apt-get update && apt-get install -y maven

# Copiar arquivos do projeto
COPY pom.xml .
COPY src src

# Compilar
RUN mvn clean package -DskipTests

# Expor porta
EXPOSE 8080

# Executar
CMD ["java", "-jar", "target/autocare-backend-1.0.0.jar"]