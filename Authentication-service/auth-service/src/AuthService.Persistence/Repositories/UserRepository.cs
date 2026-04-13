using AuthService.Application.Services;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;
using AuthService.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Persistence.Repositories;

// Repositorio para operaciones CRUD de usuarios
public class UserRepository(ApplicationDbContext context) : IUserRepository
{
    // Obtener usuario por ID con todas las relaciones
    public async Task<User> GetByIdAsync(string id)
    {
        var user = await context.Users
            .Include(u => u.UserProfile)
            .Include(u => u.UserEmail)
            .Include(u => u.UserPasswordReset)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == id);
        return user ?? throw new InvalidOperationException($"User with id {id} not found.");
    }

    // Obtener usuario por email (case insensitive)
    public async Task<User?> GetByEmailAsync(string email)
    {
        return await context.Users
            .Include(u => u.UserProfile)
            .Include(u => u.UserEmail)
            .Include(u => u.UserPasswordReset)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => EF.Functions.ILike(u.Email, email));
    }

    // Obtener usuario por username (case insensitive)
    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await context.Users
            .Include(u => u.UserProfile)
            .Include(u => u.UserEmail)
            .Include(u => u.UserPasswordReset)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => EF.Functions.ILike(u.Username, username));
    }

    // Obtener usuario por token de verificación de email
    // Obtener usuario por token de verificación de email
    public async Task<User?> GetByEmailVerificationTokenAsync(string token)
    {
        return await context.Users
            .Include(u => u.UserProfile)
            .Include(u => u.UserEmail)
            .Include(u => u.UserPasswordReset)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.UserEmail != null &&
                                    u.UserEmail.EmailVerificationToken == token &&
                                    u.UserEmail.EmailVerificationTokenExpiry > DateTime.UtcNow);
    }

    // Obtener usuario por token de reset de contraseña
    public async Task<User?> GetByPasswordResetTokenAsync(string token)
    {
        return await context.Users
            .Include(u => u.UserProfile)
            .Include(u => u.UserEmail)
            .Include(u => u.UserPasswordReset)
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.UserPasswordReset != null &&
                                    u.UserPasswordReset.PasswordResetToken == token &&
                                    u.UserPasswordReset.PasswordResetTokenExpiry > DateTime.UtcNow);
    }

    // Crear nuevo usuario
    public async Task<User> CreateAsync(User user)
    {
        context.Users.Add(user);
        await context.SaveChangesAsync();
        return await GetByIdAsync(user.Id);
    }

    // Actualizar usuario existente
    public async Task<User> UpdateAsync(User user)
    {
        // Entity is already tracked from GetByIdAsync, just save changes
        await context.SaveChangesAsync();
        return await GetByIdAsync(user.Id);
    }

    // Eliminar usuario por ID
    public async Task<bool> DeleteAsync(string id)
    {
        var user = await GetByIdAsync(id);
        context.Users.Remove(user);
        await context.SaveChangesAsync();
        return true;
    }

    // Verificar si existe usuario con email
    public async Task<bool> ExistsByEmailAsync(string email)
    {
        return await context.Users
            .AnyAsync(u => EF.Functions.ILike(u.Email, email));
    }

    // Verificar si existe usuario con username
    public async Task<bool> ExistsByUsernameAsync(string username)
    {
        return await context.Users
            .AnyAsync(u => EF.Functions.ILike(u.Username, username));
    }

    // Actualizar rol de usuario
    public async Task UpdateUserRoleAsync(string userId, string roleId)
    {
        // Remover asociaciones existentes de user-role
        var existingRoles = await context.UserRoles
            .Where(ur => ur.UserId == userId)
            .ToListAsync();
        
        context.UserRoles.RemoveRange(existingRoles);

        // Agregar nueva asociación user-role con el rol existente
        var newUserRole = new UserRole
        {
            Id = UuidGenerator.GenerateUserId(), // Generar ID para la entrada UserRole (no el Role)
            UserId = userId,
            RoleId = roleId, // Usar el ID del rol existente de la tabla roles
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        
        context.UserRoles.Add(newUserRole);
        await context.SaveChangesAsync();
    }
}