using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Domain.Entities;

// Entidad UserEmail: estado de verificación de email (uno-a-uno con User)
public class UserEmail
{
    // ID único del registro email
    [Key]
    [MaxLength(16)]
    public string Id {get; set;} = string.Empty;

    // ID del usuario (foreign key)
    [Key]
    [MaxLength(16)]
    public string UserId {get; set;} = string.Empty;

    // Si el email está verificado
    [Required]
    public bool EmailVerified {get; set;} = false;

    // Token para verificación (opcional, max 255)
    [MaxLength(255)]
    public string? EmailVerificationToken {get; set;}

    // Expiración del token
    public DateTime? EmailVerificationTokenExpiry {get; set;}

    // Fecha creación (UTC)
    public DateTime CreatedAt {get; set;} = DateTime.UtcNow;

    // Fecha actualización (UTC)
    public DateTime UpdatedAt {get; set;} = DateTime.UtcNow;

    // Referencia al usuario
    public User User {get; set;} = null!;
}
