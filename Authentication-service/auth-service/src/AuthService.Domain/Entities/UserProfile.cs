using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Domain.Entities;

// Entidad UserProfile: info adicional del usuario (uno-a-uno con User)
public class UserProfile
{
    // ID único del perfil
    [Key]
    [MaxLength(16)]
    public string Id {get; set;} = string.Empty;

    // ID del usuario (foreign key)
    [Key]
    [MaxLength(16)]
    public string UserId {get; set;} = string.Empty;

    // Teléfono (8 dígitos exactos, solo números)
    [StringLength(8, MinimumLength =8, ErrorMessage = "El teléfono debe tener 8 dígitos exactos.")]
    [RegularExpression(@"^\d{8}$", ErrorMessage = "El teléfono debe contener solo números.")]
    public string Phone {get; set;} = string.Empty;

    // Fecha creación (UTC)
    public DateTime CreatedAt {get; set;} = DateTime.UtcNow;

    // Fecha actualización (UTC)
    public DateTime UpdatedAt {get; set;} = DateTime.UtcNow;

    // Referencia al usuario
    public User User {get; set;} = null!;
}
