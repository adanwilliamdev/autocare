import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.setGlobalPrefix("api");

  const allowedOrigins = (config.get<string>("CORS_ALLOWED_ORIGINS") || "http://localhost:3000").split(",");
  app.enableCors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle("AutoCare API")
    .setDescription("API para gestão de oficinas mecânicas")
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("swagger-ui", app, document);

  const port = config.get<string>("PORT") || 8080;
  await app.listen(port);
  console.log(`AutoCare API rodando em http://localhost:${port}/api`);
}
bootstrap();
