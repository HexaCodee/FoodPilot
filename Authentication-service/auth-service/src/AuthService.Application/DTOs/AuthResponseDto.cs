namespace AuthService.Application.DTOs;

public class AuthResponseDto
{
    public bool Success { get; set; } = true;
    public string Message { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    // Compact user details for clients
    public UserDetailsDto UserDetails { get; set; } = new();
    public DateTime ExpiresAt { get; set; }
    // Token de larga duración usado para renovar el access token sin volver a loguearse
    public string RefreshToken { get; set; } = string.Empty;
}
