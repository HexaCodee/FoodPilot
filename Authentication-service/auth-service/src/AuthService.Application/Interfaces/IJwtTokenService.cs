using AuthService.Domain.Entities;

namespace AuthService.Application.Interfaces;

// Interfaz para el servicio de generación de tokens JWT
public interface IJwtTokenService
{
    string GenerateToken(User user);
}
