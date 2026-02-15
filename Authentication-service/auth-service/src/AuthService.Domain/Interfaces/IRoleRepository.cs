using System;
using AuthService.Domain.Entities;

namespace AuthService.Domain.Interfaces;

public interface IRoleRepository
{
    Task<Role?>GetByNameAsync(string roleName);// Devuelve un role que no venga vacio

    Task<int> CountUsersInRoleAsync(string roleName);// Cuenta cuantos roles hay en general
    Task<IReadOnlyList<User>> GetUsersByRoleAsync(string roleName);// Devuelve los usuario que estan asignados a un role

    Task<IReadOnlyList<string>> GetUserRoleNamesAsync(string userId);//Buscar un usuario con un role en especifico
}
