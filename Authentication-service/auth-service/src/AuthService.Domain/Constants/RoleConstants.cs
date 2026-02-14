public class RoleConstants
{
    public const string CLIENT = "CLIENT";
    public const string RESTAURANT_ADMIN = "RESTAURANT_ADMIN";
    public const string PLATFORM_ADMIN = "PLATFORM_ADMIN";

    public static readonly string[] AllowedRoles =
    {
        CLIENT,
        RESTAURANT_ADMIN,  //Roles permitidos para usuarios
        PLATFORM_ADMIN
    };
}
