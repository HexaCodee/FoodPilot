namespace AuthService.Domain.Constants;

// Constantes para nombres de roles
public class RoleConstants
{
    public const string CLIENT = "CLIENT";
    public const string RESTAURANT_ADMIN = "RESTAURANT_ADMIN";
    public const string PLATFORM_ADMIN = "PLATFORM_ADMIN";

    // Lista de roles permitidos para usuarios
    public static readonly string[] AllowedRoles =
    {
        CLIENT,
        RESTAURANT_ADMIN,  //Roles permitidos para usuarios
        PLATFORM_ADMIN
    };
}
