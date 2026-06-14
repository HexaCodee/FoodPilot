using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using AuthService.Application.DTOs;
using AuthService.Application.Interfaces;
using AuthService.Application.Validators;
using AuthService.Domain.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace AuthService.Api.Controllers;

/// <summary>
/// Gestión de usuarios para administradores de plataforma.
/// </summary>
[ApiController]
[Route("api/v1/users")]
[Tags("User Management")]
[Produces("application/json")]
[Authorize]
public class UserManagementController(IUserManagementService userManagement, IWebHostEnvironment env) : ControllerBase
{
    // Busca el claim "role" sin importar cómo ASP.NET mapee los nombres de claims
    private string? GetUserRole() =>
        User.FindFirst("role")?.Value
        ?? User.FindFirst(ClaimTypes.Role)?.Value;

    // Busca el ID del usuario autenticado desde el claim "sub"
    private string? GetUserId() =>
        User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
        ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    private IActionResult ForbiddenResponse() =>
        StatusCode(403, new { success = false, message = "Acceso denegado. Se requiere rol PLATFORM_ADMIN." });

    /// <summary>
    /// Lista todos los usuarios con paginación y filtros opcionales.
    /// </summary>
    [HttpGet]
    [SwaggerOperation(Summary = "Listar usuarios", Description = "Devuelve todos los usuarios con paginación y filtros")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search = null,
        [FromQuery] string? role = null,
        [FromQuery] int page = 1,
        [FromQuery] int limit = 20)
    {
        if (GetUserRole() != RoleConstants.PLATFORM_ADMIN) return ForbiddenResponse();

        var (userDtos, total) = await userManagement.GetAllUsersAsync(search, role, page, limit);
        var totalPages = (int)Math.Ceiling(total / (double)limit);

        return Ok(new UserListResponseDto
        {
            Users = userDtos,
            Total = total,
            Page = page,
            Limit = limit,
            TotalPages = totalPages
        });
    }

    /// <summary>
    /// Cambia el rol de un usuario.
    /// </summary>
    [HttpPut("{id}/role")]
    [SwaggerOperation(Summary = "Cambiar rol de usuario")]
    public async Task<IActionResult> UpdateRole(string id, [FromBody] UpdateUserRoleDto dto)
    {
        if (GetUserRole() != RoleConstants.PLATFORM_ADMIN) return ForbiddenResponse();
        var result = await userManagement.UpdateUserRoleAsync(id, dto.RoleName);
        return Ok(result);
    }

    /// <summary>
    /// Activa la cuenta de un usuario.
    /// </summary>
    [HttpPut("{id}/activate")]
    [SwaggerOperation(Summary = "Activar usuario")]
    public async Task<IActionResult> ActivateUser(string id)
    {
        if (GetUserRole() != RoleConstants.PLATFORM_ADMIN) return ForbiddenResponse();
        var result = await userManagement.UpdateUserStatusAsync(id, true);
        return Ok(result);
    }

    /// <summary>
    /// Desactiva la cuenta de un usuario.
    /// </summary>
    [HttpPut("{id}/deactivate")]
    [SwaggerOperation(Summary = "Desactivar usuario")]
    public async Task<IActionResult> DeactivateUser(string id)
    {
        if (GetUserRole() != RoleConstants.PLATFORM_ADMIN) return ForbiddenResponse();
        var result = await userManagement.UpdateUserStatusAsync(id, false);
        return Ok(result);
    }

    /// <summary>
    /// Actualiza el perfil del usuario autenticado (username).
    /// </summary>
    [HttpPut("me")]
    [SwaggerOperation(Summary = "Actualizar mi perfil", Description = "Permite al usuario autenticado cambiar su nombre de usuario")]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateProfileDto dto)
    {
        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { success = false, message = "Token inválido" });

        var result = await userManagement.UpdateProfileAsync(userId, dto.Username, dto.ProfilePictureUrl);
        return Ok(new { success = true, message = "Perfil actualizado", userDetails = result });
    }

    /// <summary>
    /// Sube una foto de perfil desde el dispositivo del usuario.
    /// </summary>
    /// <remarks>
    /// Acepta imágenes JPG, PNG o WEBP de hasta 5MB. La imagen se guarda en el
    /// servidor y se asigna como foto de perfil del usuario autenticado.
    /// </remarks>
    [HttpPost("me/profile-picture")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    [Consumes("multipart/form-data")]
    [SwaggerOperation(Summary = "Sube mi foto de perfil", Description = "Sube una imagen desde la galería del dispositivo y la asigna como foto de perfil")]
    public async Task<IActionResult> UploadMyProfilePicture([FromForm] UploadProfilePictureDto dto)
    {
        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { success = false, message = "Token inválido" });

        if (dto.ProfilePicture == null)
            return BadRequest(new { success = false, message = "Debe proporcionar una imagen" });

        var (isValid, error) = FileValidator.ValidateImage(dto.ProfilePicture);
        if (!isValid)
            return BadRequest(new { success = false, message = error });

        var uploadsDir = Path.Combine(env.WebRootPath, "uploads", "profile-pictures");
        Directory.CreateDirectory(uploadsDir);

        var fileName = FileValidator.GenerateSecureFileName(dto.ProfilePicture.FileName);
        await System.IO.File.WriteAllBytesAsync(Path.Combine(uploadsDir, fileName), dto.ProfilePicture.Data);

        // Construir la URL con el host que usó el cliente para llegar al servidor
        var pictureUrl = $"{Request.Scheme}://{Request.Host}/uploads/profile-pictures/{fileName}";

        var result = await userManagement.UpdateProfilePictureAsync(userId, pictureUrl);
        return Ok(new { success = true, message = "Foto de perfil actualizada", userDetails = result });
    }

    /// <summary>
    /// Elimina la cuenta del usuario autenticado.
    /// </summary>
    [HttpDelete("me")]
    [SwaggerOperation(Summary = "Eliminar mi cuenta", Description = "Elimina permanentemente la cuenta del usuario autenticado")]
    public async Task<IActionResult> DeleteMyAccount()
    {
        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(new { success = false, message = "Token inválido" });

        await userManagement.DeleteOwnAccountAsync(userId);
        return Ok(new { success = true, message = "Cuenta eliminada exitosamente" });
    }
}
