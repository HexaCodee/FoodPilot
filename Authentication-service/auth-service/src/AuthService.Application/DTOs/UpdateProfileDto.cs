using System.ComponentModel.DataAnnotations;

namespace AuthService.Application.DTOs;

public class UpdateProfileDto
{
    [Required(ErrorMessage = "El nombre de usuario es obligatorio")]
    [MaxLength(25, ErrorMessage = "El nombre de usuario no puede tener más de 25 caracteres")]
    [MinLength(3, ErrorMessage = "El nombre de usuario debe tener al menos 3 caracteres")]
    public string Username { get; set; } = string.Empty;

    // URL de la imagen de perfil (opcional — null = no cambiar)
    [MaxLength(255)]
    public string? ProfilePictureUrl { get; set; }
}
