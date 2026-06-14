using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Domain.Constants;
using AuthService.Domain.Entities;
using AuthService.Domain.Interfaces;

namespace AuthService.Application.Services;

public class UserManagementService(IUserRepository users, IRoleRepository roles) : IUserManagementService
{

    public async Task<UserResponseDto> UpdateUserRoleAsync(string userId, string roleName)
    {
        // Normalize
        roleName = roleName?.Trim().ToUpperInvariant() ?? string.Empty;

        // Validate inputs
        if (string.IsNullOrWhiteSpace(userId)) throw new ArgumentException("Invalid userId", nameof(userId));
        if (!RoleConstants.AllowedRoles.Contains(roleName))
            throw new InvalidOperationException($"Role not allowed. Use {RoleConstants.PLATFORM_ADMIN} or {RoleConstants.RESTAURANT_ADMIN}");

        // Load user with roles
        var user = await users.GetByIdAsync(userId);


        // If demoting an admin, prevent removing last admin
        var isUserAdmin = user.UserRoles.Any(r => r.Role.Name == RoleConstants.PLATFORM_ADMIN);
        if (isUserAdmin && roleName != RoleConstants.PLATFORM_ADMIN)
        {
            var adminCount = await roles.CountUsersInRoleAsync(RoleConstants.PLATFORM_ADMIN);

            if (adminCount <= 1)
            {
                throw new InvalidOperationException("Cannot remove the last administrator");
            }
        }

        // Find role entity
        var role = await roles.GetByNameAsync(roleName)
                       ?? throw new InvalidOperationException($"Role {roleName} not found");

        // Update role using repository method
        await users.UpdateUserRoleAsync(userId, role.Id);

        // Reload user with updated roles
        user = await users.GetByIdAsync(userId);

        // Map to response
        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Surname = user.Surname,
            Username = user.Username,
            Email = user.Email,
            Phone = user.UserProfile?.Phone ?? string.Empty,
            Role = role.Name,
            Status = user.Status,
            IsEmailVerified = user.UserEmail?.EmailVerified ?? false,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }

    public async Task<IReadOnlyList<string>> GetUserRolesAsync(string userId)
    {
        var roleNames = await roles.GetUserRoleNamesAsync(userId);
        return roleNames;
    }

    public async Task<IReadOnlyList<UserResponseDto>> GetUsersByRoleAsync(string roleName)
    {
        roleName = roleName?.Trim().ToUpperInvariant() ?? string.Empty;
        var usersInRole = await roles.GetUsersByRoleAsync(roleName);
        return usersInRole.Select(u => new UserResponseDto
        {
            Id = u.Id,
            Name = u.Name,
            Surname = u.Surname,
            Username = u.Username,
            Email = u.Email,
            Phone = u.UserProfile?.Phone ?? string.Empty,
            Role = roleName,
            Status = u.Status,
            IsEmailVerified = u.UserEmail?.EmailVerified ?? false,
            CreatedAt = u.CreatedAt,
            UpdatedAt = u.UpdatedAt
        }).ToList();
    }

    public async Task<(IReadOnlyList<UserResponseDto> Users, int Total)> GetAllUsersAsync(string? search, string? role, int page, int limit)
    {
        if (page < 1) page = 1;
        if (limit < 1 || limit > 100) limit = 20;

        var (rawUsers, total) = await users.GetAllAsync(search, role, page, limit);

        // Obtener fotos de perfil en una sola consulta para toda la página
        var ids = rawUsers.Select(u => u.Id).ToList();
        var pictures = await users.GetProfilePicturesBatchAsync(ids);

        var dtos = rawUsers.Select(u =>
        {
            var primaryRole = u.UserRoles.FirstOrDefault()?.Role?.Name ?? string.Empty;
            pictures.TryGetValue(u.Id, out var pic);
            return new UserResponseDto
            {
                Id = u.Id,
                Name = u.Name,
                Surname = u.Surname,
                Username = u.Username,
                Email = u.Email,
                ProfilePicture = pic ?? string.Empty,
                Phone = u.UserProfile?.Phone ?? string.Empty,
                Role = primaryRole,
                Status = u.Status,
                IsEmailVerified = u.UserEmail?.EmailVerified ?? false,
                CreatedAt = u.CreatedAt,
                UpdatedAt = u.UpdatedAt
            };
        }).ToList();

        return (dtos, total);
    }

    public async Task<UserResponseDto> UpdateUserStatusAsync(string userId, bool status)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("Invalid userId", nameof(userId));

        var user = await users.UpdateStatusAsync(userId, status);
        var primaryRole = user.UserRoles.FirstOrDefault()?.Role?.Name ?? string.Empty;

        return new UserResponseDto
        {
            Id = user.Id,
            Name = user.Name,
            Surname = user.Surname,
            Username = user.Username,
            Email = user.Email,
            Phone = user.UserProfile?.Phone ?? string.Empty,
            Role = primaryRole,
            Status = user.Status,
            IsEmailVerified = user.UserEmail?.EmailVerified ?? false,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }

    public async Task<UserDetailsDto> UpdateProfileAsync(string userId, string username, string? profilePictureUrl = null)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("Invalid userId", nameof(userId));

        username = username.Trim();

        // Check uniqueness (skip if same user keeps same username)
        var existing = await users.GetByUsernameAsync(username);
        if (existing != null && existing.Id != userId)
            throw new InvalidOperationException("El nombre de usuario ya está en uso");

        var user = await users.GetByIdAsync(userId);
        user.Username  = username;
        user.UpdatedAt = DateTime.UtcNow;
        await users.UpdateAsync(user);

        // Save profile picture via raw SQL (not through EF Core model)
        if (profilePictureUrl != null)
            await users.UpdateProfilePictureAsync(userId, profilePictureUrl);

        var role = user.UserRoles.FirstOrDefault()?.Role?.Name ?? string.Empty;

        // Return the picture URL that was just saved (or fetch current one only when no new URL was provided)
        string picUrl;
        if (profilePictureUrl != null)
        {
            picUrl = profilePictureUrl;
        }
        else
        {
            picUrl = await users.GetProfilePictureAsync(userId);
        }

        return new UserDetailsDto
        {
            Id             = user.Id,
            Username       = user.Username,
            ProfilePicture = picUrl,
            Role           = role,
        };
    }

    public async Task<UserDetailsDto> UpdateProfilePictureAsync(string userId, string pictureUrl)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("Invalid userId", nameof(userId));

        await users.UpdateProfilePictureAsync(userId, pictureUrl);

        var user = await users.GetByIdAsync(userId);
        var role = user.UserRoles.FirstOrDefault()?.Role?.Name ?? string.Empty;

        return new UserDetailsDto
        {
            Id             = user.Id,
            Username       = user.Username,
            ProfilePicture = pictureUrl,
            Role           = role,
        };
    }

    public async Task DeleteOwnAccountAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("Invalid userId", nameof(userId));

        var deleted = await users.DeleteAsync(userId);
        if (!deleted)
            throw new InvalidOperationException("No se pudo eliminar la cuenta");
    }
}
