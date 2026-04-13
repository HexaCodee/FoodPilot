using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Domain.Entities;

// Entidad UserPasswordReset: tokens para reset de contraseña (uno-a-uno con User)
public class UserPasswordReset
{
    // ID único del registro reset
    [Key]
    [MaxLength(16)]
    public string Id {get; set;} = string.Empty;

    // ID del usuario (foreign key)
    [Key]
    [MaxLength(16)]
    public string UserId {get; set;} = string.Empty;

    // Token para reset de contraseña (opcional, max 255)
    [MaxLength(255)]
    public string? PasswordResetToken {get; set;}

    // Expiración del token
    public DateTime? PasswordResetTokenExpiry {get; set;}

    // Fecha creación (UTC)
    public DateTime CreatedAt {get; set;} = DateTime.UtcNow;

    // Fecha actualización (UTC)
    public DateTime UpdatedAt {get; set;} = DateTime.UtcNow;

    // Referencia al usuario
    public User User {get; set;} = null!;
}
