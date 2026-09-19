import { SetMetadata } from "@nestjs/common";

// Marca uma rota como isenta do JwtAuthGuard global — usado apenas em
// /auth/login, /auth/register e /auth/refresh, iguais aos permitAll() do
// SecurityConfig.java original. /auth/users fica de fora de propósito.
export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
