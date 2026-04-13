using System;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;
using AuthService.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Persistence.Repositories;

// Repositorio para operaciones de roles
public class RoleRepository(ApplicationDbContext context) : IRoleRepository
{
    // Contar usuarios en un rol específico
    public async Task<int> CountUsersInRoleAsync(string roleName)
    {
        return await context.UserRoles
            .Include(ur => ur.Role)
            .Where(ur => ur.Role.Name == roleName)
            .Select(ur => ur.UserId)
            .Distinct()
            .CountAsync();
    }

    // Obtener rol por nombre
    public async Task<Role?> GetByNameAsync(string roleName)
    {
        return await context.Roles.FirstOrDefaultAsync(r => r.Name == roleName);
    }

    // Obtener nombres de roles de un usuario
    public async Task<IReadOnlyList<string>> GetUserRoleNamesAsync(string userId)
    {
        return await context.UserRoles
            .Include(ur => ur.Role)
            .Where(ur => ur.UserId == userId)
            .Select(ur => ur.Role.Name)
            .ToListAsync();
    }

    // Obtener usuarios por rol
    public async Task<IReadOnlyList<User>> GetUsersByRoleAsync(string roleName)
    {
        var users = await context.Users
            .Include(u => u.UserProfile)
            .Include(u => u.UserEmail)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .Where(u => u.UserRoles.Any(ur => ur.Role.Name == roleName))
            .ToListAsync();
        return users;
    }
}