using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Domain.Entities;

// Entidad Usuario: representa usuario con credenciales y relaciones
public class User
{
    // ID único (UUID 16 chars)
    [Key]
    [MaxLength(16)]
    public String Id {get; set;} = string.Empty;

    // Nombre (obligatorio, max 25)
    [Required(ErrorMessage = "El nombre es obligatorio")]
    [MaxLength(25, ErrorMessage = "El nombre no puede tener mas de 25 caracteres")]
    public String Name {get; set;} = string.Empty;

    // Apellido (obligatorio, max 50)
    [Required(ErrorMessage = "El apellido es obligatorio")]
    [MaxLength(50, ErrorMessage = "El apellido no puede tener mas de 50 caracteres")]
    public string Surname {get; set;} = string.Empty;

    // Username (obligatorio, max 25, único)
    [Required(ErrorMessage = "El username es obligatorio")]
    [MaxLength(25, ErrorMessage = "El username no puede tener mas de 25 caracteres")]
    public string Username {get; set;} = string.Empty;

    // Email (obligatorio, único, formato válido)
    [Required(ErrorMessage = "El email es obligatorio")]
    [EmailAddress(ErrorMessage = "El email no tiene el formato correcto")]
    [MaxLength(150, ErrorMessage = "El email no puede tener mas de 150 caracteres")]
    public string Email {get; set;} = string.Empty;

    // Contraseña hasheada (obligatoria, min 8)
    [Required(ErrorMessage = "La contraseña es obligatoria")]
    [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
    [MaxLength(255, ErrorMessage = "La contraseña no puede tener mas de 50 caracteres")]
    public string Password {get; set;} = string.Empty;

    // Estado: true activo, false inactivo
    public bool Status {get; set;} = false;

    // Fecha creación (UTC)
    public DateTime CreatedAt {get; set;} = DateTime.UtcNow;

    // Fecha actualización (UTC)
    public DateTime UpdatedAt {get; set;} = DateTime.UtcNow;

    // Roles asociados (muchos-a-muchos)
    public ICollection<UserRole> UserRoles {get; set;} = [];

    // Perfil adicional (uno-a-uno)
    public UserProfile UserProfile {get; set;} = null!;

    // Info email y verificación (uno-a-uno)
    public UserEmail UserEmail {get; set;} = null!;

    // Info reset contraseña (uno-a-uno)
    public UserPasswordReset UserPasswordReset {get; set;} = null!;
}
