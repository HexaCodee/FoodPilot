using System;
using AuthService.Application.DTOs;
using AuthService.Application.DTOs.Email;
using AuthService.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Swashbuckle.AspNetCore.Annotations;

namespace AuthService.Api.Controllers;

/// <summary>
/// Controlador de Autenticación.
/// Gestiona la autenticación de usuarios, registro y verificación de email.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Tags("Authentication")]
[Produces("application/json")]
public class AuthController(IAuthService authService) : ControllerBase
{
    /// <summary>
    /// Autentica un usuario con sus credenciales.
    /// </summary>
    /// <remarks>
    /// Valida las credenciales del usuario y devuelve un token JWT válido por 60 minutos.
    /// 
    /// Límite de rate limiting: 5 intentos por minuto
    /// </remarks>
    /// <param name="loginDto">Objeto con email y contraseña del usuario</param>
    /// <returns>Token JWT y datos del usuario autenticado</returns>
    /// <response code="200">Login exitoso. Devuelve token JWT y datos del usuario.</response>
    /// <response code="400">Credenciales inválidas o datos incompletos.</response>
    /// <response code="429">Límite de rate limiting excedido.</response>
    /// <response code="500">Error interno del servidor.</response>
    [HttpPost("login")]
    [EnableRateLimiting("AuthPolicy")]
    [SwaggerOperation(
        Summary = "Autentica un usuario",
        Description = "Realiza el login del usuario y devuelve un token JWT"
    )]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto loginDto)
    {
        var result = await authService.LoginAsync(loginDto);
        return Ok(result);
    }

    /// <summary>
    /// Registra un nuevo usuario en el sistema.
    /// </summary>
    /// <remarks>
    /// Crea una nueva cuenta de usuario con verificación de email automática.
    /// 
    /// - Se solicita un archivo de foto de perfil (máximo 10MB)
    /// - Se envía un email de verificación al usuario
    /// - El usuario debe verificar su email antes de poder usar la cuenta
    /// - Límite de rate limiting: 3 registros por hora
    /// 
    /// Formato requerido: multipart/form-data
    /// </remarks>
    /// <param name="registerDto">Objeto con datos de registro (email, contraseña, nombre, foto)</param>
    /// <returns>Datos de confirmación del registro</returns>
    /// <response code="201">Registro exitoso. Email de verificación enviado.</response>
    /// <response code="400">Datos incompletos o inválidos. El email podría estar registrado.</response>
    /// <response code="409">El email ya existe en el sistema.</response>
    /// <response code="413">El archivo de foto excede el tamaño máximo de 10MB.</response>
    /// <response code="429">Límite de rate limiting excedido.</response>
    /// <response code="500">Error interno del servidor.</response>
    [HttpPost("register")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    [EnableRateLimiting("AuthPolicy")]
    [SwaggerOperation(
        Summary = "Registra un nuevo usuario",
        Description = "Crea una nueva cuenta de usuario con verificación de email"
    )]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<RegisterResponseDto>> Register([FromForm] RegisterDto registerDto)
    {
        var result = await authService.RegisterAsync(registerDto);
        return StatusCode(201, result);
    }

    /// <summary>
    /// Verifica el email de un usuario.
    /// </summary>
    /// <remarks>
    /// Utiliza un token de verificación enviado al email del usuario durante el registro.
    /// 
    /// - El token tiene una validez de 24 horas
    /// - Una vez verificado, el usuario puede iniciar sesión normalmente
    /// - No se puede verificar un email si ya está verificado
    /// </remarks>
    /// <param name="verifyEmailDto">Objeto con email y token de verificación</param>
    /// <returns>Confirmación del email verificado</returns>
    /// <response code="200">Email verificado exitosamente.</response>
    /// <response code="400">Token inválido, expirado o datos incompletos.</response>
    /// <response code="404">Usuario no encontrado.</response>
    /// <response code="409">El email ya ha sido verificado anteriormente.</response>
    /// <response code="429">Límite de rate limiting excedido.</response>
    /// <response code="500">Error interno del servidor.</response>
    [HttpPost("verify-email")]
    [EnableRateLimiting("ApiPolicy")]
    [SwaggerOperation(
        Summary = "Verifica el email de un usuario",
        Description = "Valida el token de verificación y marca el email como verificado"
    )]
    public async Task<ActionResult<EmailResponseDto>> VerifyEmail([FromBody] VerifyEmailDto verifyEmailDto)
    {
        var result = await authService.VerifyEmailAsync(verifyEmailDto);
        return Ok(result);
    }
}
