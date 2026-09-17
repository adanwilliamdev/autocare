package com.autocare.auth.service;

import com.autocare.auth.dto.CreateUserRequest;
import com.autocare.auth.dto.LoginRequest;
import com.autocare.auth.dto.LoginResponse;
import com.autocare.auth.dto.RefreshTokenRequest;
import com.autocare.auth.dto.RegisterRequest;
import com.autocare.auth.entity.RefreshToken;
import com.autocare.auth.entity.Role;
import com.autocare.auth.entity.User;
import com.autocare.auth.repository.RefreshTokenRepository;
import com.autocare.auth.repository.UserRepository;
import com.autocare.shared.exception.BusinessException;
import com.autocare.shared.exception.ResourceNotFoundException;
import com.autocare.shared.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final long REFRESH_TOKEN_VALIDITY_DAYS = 7;

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        // Lança BadCredentialsException em caso de falha, tratada pelo GlobalExceptionHandler (401).
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        String token = jwtService.generateToken(user);
        String refreshToken = issueRefreshToken(user.getId());

        return LoginResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    /**
     * Troca um refresh token válido por um novo access token (e rotaciona o refresh token,
     * invalidando o anterior). Usado pelo frontend quando o access token expira, evitando
     * obrigar o usuário a logar novamente a cada 24h.
     */
    @Transactional
    public LoginResponse refresh(RefreshTokenRequest request) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BusinessException("Refresh token inválido"));

        if (storedToken.isRevoked() || storedToken.isExpired()) {
            throw new BusinessException("Refresh token expirado ou revogado. Faça login novamente");
        }

        User user = userRepository.findById(storedToken.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        // Rotaciona o refresh token: o antigo não pode mais ser reutilizado.
        refreshTokenRepository.revokeByToken(storedToken.getToken());
        String newRefreshToken = issueRefreshToken(user.getId());
        String newAccessToken = jwtService.generateToken(user);

        return LoginResponse.builder()
                .token(newAccessToken)
                .refreshToken(newRefreshToken)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    @Transactional
    public void logout(RefreshTokenRequest request) {
        refreshTokenRepository.revokeByToken(request.getRefreshToken());
    }

    /**
     * Autocadastro público. Por segurança, SEMPRE cria a conta com o papel mínimo
     * (RECEPTIONIST), independentemente do que for enviado — não existe mais campo
     * "role" no request. Um usuário mal-intencionado não consegue mais se
     * autopromover a ADMIN por aqui (ver CreateUserRequest para criação com papel).
     */
    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Este email já está cadastrado");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.RECEPTIONIST)
                .isActive(true)
                .build();

        userRepository.save(user);
    }

    /**
     * Criação de usuário com papel arbitrário. Só pode ser chamado por um ADMIN
     * autenticado (a restrição fica no @PreAuthorize do controller).
     */
    @Transactional
    public void createUserByAdmin(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Este email já está cadastrado");
        }

        Role role;
        try {
            role = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Papel inválido: " + request.getRole());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .isActive(true)
                .build();

        userRepository.save(user);
    }

    private String issueRefreshToken(String userId) {
        String token = UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .userId(userId)
                .expiresAt(LocalDateTime.now().plusDays(REFRESH_TOKEN_VALIDITY_DAYS))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);
        return token;
    }
}
