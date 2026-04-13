namespace AuthService.Application.Interfaces;

// Interfaz para el servicio de hash de contraseñas
public interface IPasswordHashService
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hashedPassword);
}
