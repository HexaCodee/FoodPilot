namespace AuthService.Application.DTOs;

// Respuesta de POST /auth/refresh — usa "accessToken" (no "token") porque
// es lo que espera el interceptor de axios del cliente móvil.
public class RefreshResponseDto
{
    public bool Success { get; set; } = true;
    public string Message { get; set; } = string.Empty;
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public UserDetailsDto UserDetails { get; set; } = new();
    public DateTime ExpiresAt { get; set; }
}
