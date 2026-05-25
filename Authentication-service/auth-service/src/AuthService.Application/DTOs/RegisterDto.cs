using System.ComponentModel.DataAnnotations;
using AuthService.Application.Interfaces;

namespace AuthService.Application.DTOs;

public class RegisterDto
{
    [MaxLength(25)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(25)]
    public string Surname { get; set; } = string.Empty;

    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public IFileData? ProfilePicture { get; set; }

    // URL de foto de perfil subida previamente al servidor de medios
    [MaxLength(255)]
    public string? ProfilePictureUrl { get; set; }
}
