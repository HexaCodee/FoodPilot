namespace AuthService.Domain.Interfaces;

// Repositorio para refresh tokens (almacenados como hash, fuera del modelo de EF Core)
public interface IRefreshTokenRepository
{
    // Guarda un nuevo refresh token (hash) para el usuario
    Task CreateAsync(string userId, string tokenHash, DateTime expiresAt);

    // Devuelve el userId si el hash corresponde a un token vigente (no expirado ni revocado)
    Task<string?> GetUserIdForValidTokenAsync(string tokenHash);

    // Revoca un refresh token (rotación o logout)
    Task RevokeAsync(string tokenHash);
}
