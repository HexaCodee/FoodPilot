using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Domain.Entities;

// Entidad UserRole: relación muchos-a-muchos entre User y Role
public class UserRole
{
    // ID único de la relación
    [Key]
    [MaxLength(16)]
    public  string Id {get; set;} = string.Empty;

    // ID del usuario
    [Key]
    [MaxLength(16)]
    public string UserId {get; set;} = string.Empty;

    // ID del rol
    [Key]
    [MaxLength(16)]
    public string RoleId {get; set;} = string.Empty;

    // Fecha creación (UTC)
    public DateTime CreatedAt {get; set;} = DateTime.UtcNow;

    // Fecha actualización (UTC)
    public DateTime UpdatedAt {get; set;} = DateTime.UtcNow;

    // Referencia al usuario
    public User User {get; set;} = null!;

    // Referencia al rol
    public Role Role {get; set;} = null!;
}
