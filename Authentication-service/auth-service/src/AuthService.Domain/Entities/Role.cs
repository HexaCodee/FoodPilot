using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Domain.Entities;

// Entidad Rol: define roles como CLIENT, ADMIN
public class Role
{
    // ID único (UUID 16 chars)
    [Key]
    [MaxLength(16)]
    public string Id { get; set;} = string.Empty;

    // Nombre del rol (obligatorio, max 35, único)
    [Required(ErrorMessage = "El nombre del Rol es obligatorio.")]
    [MaxLength(35, ErrorMessage = "El nombre del Role no puede exceder los 35 caracteres")]
    public string Name { get; set;} = string.Empty;

    // Fecha creación (UTC)
    public DateTime CreatedAt { get; set;} = DateTime.UtcNow;

    // Fecha actualización (UTC)
    public DateTime UpdatedAt {get; set;} = DateTime.UtcNow;

    // Usuarios con este rol (muchos-a-muchos)
    public ICollection<UserRole> UserRoles {get; set;} = [];
}
