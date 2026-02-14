using System;
using System.ComponentModel.DataAnnotations;

namespace AuthService.Domain.Entities;

public class User
{
    [Key]
    [MaxLength(16)]
    public String Id {get; set;} = string.Empty; //Identificador

    [Required(ErrorMessage = "El nombre es obligatorio")]
    [MaxLength(25, ErrorMessage = "El nombre no puede tener mas de 25 caracteres")]
    public String Name {get; set;} = string.Empty;  //Nombre de usuario

    [Required(ErrorMessage = "El apellido es obligatorio")]
    [MaxLength(50, ErrorMessage = "El apellido no puede tener mas de 50 caracteres")]
    public string Surname {get; set;} = string.Empty; //Apellido de usuario

    [Required(ErrorMessage = "El username es obligatorio")]
    [MaxLength(25, ErrorMessage = "El username no puede tener mas de 25 caracteres")]
    public string Username {get; set;} = string.Empty; //Alias del usuario(no confundir con el nombre)

    [Required(ErrorMessage = "El email es obligatorio")]
    [EmailAddress(ErrorMessage = "El email no tiene el formato correcto")]
    [MaxLength(150, ErrorMessage = "El email no puede tener mas de 150 caracteres")]
    public string Email {get; set;} = string.Empty; //Email del usuario

    [Required(ErrorMessage = "La contraseña es obligatoria")]
    [MinLength(8, ErrorMessage = "La contraseña debe tener al menos 8 caracteres")]
    [MaxLength(255, ErrorMessage = "La contraseña no puede tener mas de 50 caracteres")]
    public string Password {get; set;} = string.Empty; //Contraseña del usuario

    public bool Status {get; set;} =  false; //Activo o inactivo(por default)

    public DateTime CreatedAt {get; set;} = DateTime.UtcNow;
                                                                //Datos sobre fecha
    public DateTime UpdatedAt {get; set;} = DateTime.UtcNow;  

    public ICollection<UserRole> UserRoles {get; set;} = [];

    public UserProfile UserProfile {get; set;} = null!;
                                                                //Relaciones con entidades
    public UserEmail UserEmail {get; set;} = null!;

    public UserPasswordReset UserPasswordReset {get; set;} = null!;
}
