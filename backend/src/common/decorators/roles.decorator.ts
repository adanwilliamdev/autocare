import { SetMetadata } from "@nestjs/common";
import { Role } from "@prisma/client";

// Equivalente a @PreAuthorize("hasAnyRole(...)") do Spring Security.
export const ROLES_KEY = "roles";
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
