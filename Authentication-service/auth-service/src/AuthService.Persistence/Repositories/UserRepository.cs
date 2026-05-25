using AuthService.Application.Services;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;
using AuthService.Persistence.Data;
using Microsoft.EntityFrameworkCore;
using System.Data;

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

    // Guardar cambios sin recargar - para operaciones simples
    public async Task SaveChangesAsync()
    {
        await context.SaveChangesAsync();
    }

    // Agregar password reset directamente
    public async Task AddPasswordResetAsync(UserPasswordReset passwordReset)
    {
        context.UserPasswordResets.Add(passwordReset);
        await context.SaveChangesAsync();
    }

    // Actualizar password reset existente
    public async Task UpdatePasswordResetAsync(UserPasswordReset passwordReset)
    {
        var existing = await context.UserPasswordResets
            .FirstOrDefaultAsync(pr => pr.UserId == passwordReset.UserId);
        
        if (existing != null)
        {
            existing.PasswordResetToken = passwordReset.PasswordResetToken;
            existing.PasswordResetTokenExpiry = passwordReset.PasswordResetTokenExpiry;
        }
        else
        {
            context.UserPasswordResets.Add(passwordReset);
        }
        
        await context.SaveChangesAsync();
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

    // Obtener todos los usuarios con filtros y paginación
    public async Task<(IReadOnlyList<User> Users, int Total)> GetAllAsync(string? search, string? role, int page, int limit)
    {
        var query = context.Users
            .Include(u => u.UserProfile)
            .Include(u => u.UserEmail)
            .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
            .AsQueryable();

        // Filtrar por rol si se especifica
        if (!string.IsNullOrWhiteSpace(role))
        {
            var normalizedRole = role.Trim().ToUpperInvariant();
            query = query.Where(u => u.UserRoles.Any(ur => ur.Role.Name == normalizedRole));
        }

        // Filtrar por búsqueda (nombre, apellido, username o email)
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLowerInvariant();
            query = query.Where(u =>
                u.Name.ToLower().Contains(term) ||
                u.Surname.ToLower().Contains(term) ||
                u.Username.ToLower().Contains(term) ||
                u.Email.ToLower().Contains(term));
        }

        var total = await query.CountAsync();
        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * limit)
            .Take(limit)
            .ToListAsync();

        return (users, total);
    }

    // Leer URL de foto de perfil directamente (sin pasar por el modelo de EF Core)
    public async Task<string> GetProfilePictureAsync(string userId)
    {
        try
        {
            // Abrir una conexión independiente para no interferir con la conexión activa de EF Core
            var connStr = context.Database.GetConnectionString()!;
            await using var conn = new Npgsql.NpgsqlConnection(connStr);
            await conn.OpenAsync();
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT COALESCE(profile_picture, '') FROM user_profiles WHERE user_id = @uid";
            cmd.CommandTimeout = 10; // 10 s máximo
            cmd.Parameters.AddWithValue("@uid", userId);
            var result = await cmd.ExecuteScalarAsync();
            return result as string ?? string.Empty;
        }
        catch
        {
            // Columna aún no existe en la DB — devolver vacío
            return string.Empty;
        }
    }

    // Leer fotos de perfil para múltiples usuarios en una sola consulta (evita N+1)
    public async Task<IReadOnlyDictionary<string, string>> GetProfilePicturesBatchAsync(IEnumerable<string> userIds)
    {
        var result = new Dictionary<string, string>();
        try
        {
            var ids = userIds.ToList();
            if (ids.Count == 0) return result;

            var connStr = context.Database.GetConnectionString()!;
            await using var conn = new Npgsql.NpgsqlConnection(connStr);
            await conn.OpenAsync();
            await using var cmd = conn.CreateCommand();

            // Construir IN (@p0, @p1, ...) dinámicamente — compatible con cualquier versión de Npgsql
            var paramNames = ids.Select((_, i) => $"@p{i}").ToList();
            cmd.CommandText = $"SELECT user_id, COALESCE(profile_picture, '') FROM user_profiles WHERE user_id IN ({string.Join(", ", paramNames)})";
            cmd.CommandTimeout = 10;
            for (var i = 0; i < ids.Count; i++)
                cmd.Parameters.AddWithValue($"@p{i}", ids[i]);

            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
                result[reader.GetString(0)] = reader.GetString(1);
        }
        catch { /* columna aún no existe — devolvemos dict vacío */ }
        return result;
    }

    // Guardar URL de foto de perfil directamente (sin pasar por el modelo de EF Core)
    public async Task UpdateProfilePictureAsync(string userId, string pictureUrl)
    {
        try
        {
            var connStr = context.Database.GetConnectionString()!;
            await using var conn = new Npgsql.NpgsqlConnection(connStr);
            await conn.OpenAsync();
            await using var cmd = conn.CreateCommand();
            cmd.CommandText = "UPDATE user_profiles SET profile_picture = @pic WHERE user_id = @uid";
            cmd.CommandTimeout = 10;
            cmd.Parameters.AddWithValue("@pic", pictureUrl);
            cmd.Parameters.AddWithValue("@uid", userId);
            await cmd.ExecuteNonQueryAsync();
        }
        catch
        {
            // Columna aún no existe — la ignoramos, el ALTER TABLE la añadirá al reiniciar
        }
    }

    // Activar o desactivar usuario
    public async Task<User> UpdateStatusAsync(string userId, bool status)
    {
        var user = await GetByIdAsync(userId);
        user.Status = status;
        user.UpdatedAt = DateTime.UtcNow;
        await context.SaveChangesAsync();
        return await GetByIdAsync(userId);
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