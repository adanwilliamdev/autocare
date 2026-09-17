package com.autocare.shared.security;

import com.autocare.auth.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Utilitário para obter o usuário autenticado a partir do contexto de segurança.
 *
 * Sempre que um dado de auditoria (ex.: "quem fez esta alteração") for necessário,
 * ele deve vir daqui — nunca de um parâmetro enviado pelo cliente, que pode ser
 * forjado (ex.: um usuário poderia informar o ID de outra pessoa).
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            throw new IllegalStateException("Nenhum usuário autenticado no contexto de segurança");
        }
        return (User) authentication.getPrincipal();
    }

    public static String getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
