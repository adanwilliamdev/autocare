# --- Etapa 1: build com Maven + JDK 21 ---
FROM eclipse-temurin:21-jdk-jammy AS build

WORKDIR /app

# Instala o Maven (imagem eclipse-temurin não vem com ele)
RUN apt-get update && apt-get install -y --no-install-recommends maven && rm -rf /var/lib/apt/lists/*

# Copia primeiro só o pom.xml para aproveitar cache de dependências
COPY pom.xml .
RUN mvn -B dependency:go-offline

# Copia o restante do código e compila
COPY src src
RUN mvn -B clean package -DskipTests

# --- Etapa 2: imagem final, só com JRE (menor e sem Maven/JDK) ---
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
