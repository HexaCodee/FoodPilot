using AuthService.Application.DTOs;

namespace AuthService.Application.Interfaces;

// Interfaz para el servicio de gestión de usuarios
public interface IUserManagementService
{
    Task<UserResponseDto> UpdateUserRoleAsync(string userId, string roleName);
    Task<IReadOnlyList<string>> GetUserRolesAsync(string userId);
    Task<IReadOnlyList<UserResponseDto>> GetUsersByRoleAsync(string roleName);
    Task<(IReadOnlyList<UserResponseDto> Users, int Total)> GetAllUsersAsync(string? search, string? role, int page, int limit);
    Task<UserResponseDto> UpdateUserStatusAsync(string userId, bool status);
}
