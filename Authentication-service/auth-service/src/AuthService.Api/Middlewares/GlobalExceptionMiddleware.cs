using System.Net;
using System.Text.Json;
using AuthService.Api.Models;
using AuthService.Application.Exceptions;

namespace AuthService.Api.Middlewares;

public class GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var response = exception switch
        {
            BusinessException businessEx => new ErrorResponse
            {
                StatusCode = (int)HttpStatusCode.BadRequest,
                Title = "Business Logic Error",
                Detail = businessEx.Message,
                ErrorCode = businessEx.ErrorCode
            },
            // Antes se devolvía siempre el mensaje genérico "Credenciales inválidas o
            // permisos insuficientes", lo que ocultaba al usuario casos como la cuenta
            // deshabilitada por falta de verificación de email (LoginAsync lanza
            // "La cuenta de usuario está deshabilitada" en ese caso). Ahora se
            // preserva el mensaje real del servicio para que el cliente (web/móvil)
            // pueda mostrar la causa correcta.
            UnauthorizedAccessException unauthEx => new ErrorResponse
            {
                StatusCode = (int)HttpStatusCode.Unauthorized,
                Title = "Unauthorized",
                Detail = string.IsNullOrWhiteSpace(unauthEx.Message)
                    ? "Credenciales inválidas o permisos insuficientes"
                    : unauthEx.Message
            },
            ArgumentException argEx => new ErrorResponse
            {
                StatusCode = (int)HttpStatusCode.BadRequest,
                Title = "Invalid Arguments",
                Detail = argEx.Message
            },
            InvalidOperationException invOpEx => MapInvalidOperation(invOpEx),
            _ => new ErrorResponse
            {
                StatusCode = (int)HttpStatusCode.InternalServerError,
                Title = "Internal Server Error",
                Detail = "An unexpected error occurred"
            }
        };

        context.Response.StatusCode = response.StatusCode;

        // Construir respuesta unificada para errores
        var unified = new
        {
            success = false,
            message = response.Detail,
            errorCode = response.ErrorCode,
            traceId = response.TraceId,
            timestamp = response.Timestamp
        };

        var jsonResponse = JsonSerializer.Serialize(unified, JsonOptions);
        await context.Response.WriteAsync(jsonResponse);
    }

    private static ErrorResponse MapInvalidOperation(InvalidOperationException ex)
    {
        var message = ex.Message ?? string.Empty;
        var lower = message.ToLowerInvariant();

        if (lower.Contains("not found"))
        {
            return new ErrorResponse
            {
                StatusCode = (int)HttpStatusCode.NotFound,
                Title = "Not Found",
                Detail = message
            };
        }

        if (lower.Contains("last administrator") || lower.Contains("conflict"))
        {
            return new ErrorResponse
            {
                StatusCode = (int)HttpStatusCode.Conflict,
                Title = "Conflict",
                Detail = message
            };
        }

        return new ErrorResponse
        {
            StatusCode = (int)HttpStatusCode.BadRequest,
            Title = "Invalid Operation",
            Detail = message
        };
    }
}

