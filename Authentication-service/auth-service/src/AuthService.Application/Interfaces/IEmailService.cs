namespace AuthService.Application.Interfaces;

// Interfaz para el servicio de envío de emails
public interface IEmailService
{
    Task SendEmailVerificationAsync(string email, string username, string token);
    Task SendPasswordResetAsync(string email, string username, string token);
    Task SendWelcomeEmailAsync(string email, string username);
}
