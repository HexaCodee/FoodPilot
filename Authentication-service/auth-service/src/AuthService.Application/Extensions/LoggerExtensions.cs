using System;
using Microsoft.Extensions.Logging;

namespace AuthService.Application.Extensions;

// Extensiones para logging estructurado
public static partial class LoggerExtensions
{
    // Log cuando un usuario se registra exitosamente
    [LoggerMessage(
        EventId = 1001,
        Level = LogLevel.Information,
        Message = "User {Username} registered successfully")]
    public static partial void LogUserRegistered(this ILogger logger, string username);

    // Log cuando un usuario inicia sesión exitosamente
    [LoggerMessage(
        EventId = 1002,
        Level = LogLevel.Information,
        Message = "User login succeeded")]
    public static partial void LogUserLoggedIn(this ILogger logger);

    // Log cuando falla un intento de login
    [LoggerMessage(
        EventId = 1003,
        Level = LogLevel.Warning,
        Message = "Failed login attempt")]
    public static partial void LogFailedLoginAttempt(this ILogger logger);

    // Log cuando se rechaza registro por email existente
    [LoggerMessage(
        EventId = 1004,
        Level = LogLevel.Warning,
        Message = "Registration rejected: email already exists")]
    public static partial void LogRegistrationWithExistingEmail(this ILogger logger);

    // Log cuando se rechaza registro por username existente
    [LoggerMessage(
        EventId = 1005,
        Level = LogLevel.Warning,
        Message = "Registration rejected: username already exists")]
    public static partial void LogRegistrationWithExistingUsername(this ILogger logger);

    // Log error al subir imagen de perfil
    [LoggerMessage(
        EventId = 1006,
        Level = LogLevel.Error,
        Message = "Error uploading profile image")]
    public static partial void LogImageUploadError(this ILogger logger);
}
