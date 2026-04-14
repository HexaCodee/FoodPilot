using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace AuthService.Api.Controllers;

/// <summary>
/// Controlador de Salud del Servicio.
/// Proporciona endpoints para verificar el estado operativo del servicio de autenticación.
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Tags("Health")]
[Produces("application/json")]
public class HealthController : ControllerBase
{
    /// <summary>
    /// Verifica el estado actual del servicio de autenticación.
    /// </summary>
    /// <remarks>
    /// Este endpoint no requiere autenticación y puede ser utilizado por:
    /// - Load balancers para verificar disponibilidad
    /// - Sistemas de monitoreo
    /// - Health checks de contenedores Docker
    /// - Clientes para confirmar conectividad
    /// 
    /// La respuesta incluye:
    /// - status: Estado actual del servicio (Healthy, Degraded, Unhealthy)
    /// - timestamp: Hora UTC de la verificación
    /// - service: Nombre del servicio
    /// </remarks>
    /// <returns>Estado del servicio con timestamp</returns>
    /// <response code="200">Servicio disponible y funcionando correctamente.</response>
    /// <response code="503">Servicio no disponible o degradado.</response>
    [HttpGet]
    [AllowAnonymous]
    [SwaggerOperation(
        Summary = "Obtiene el estado del servicio",
        Description = "Verifica si el servicio de autenticación está disponible"
    )]
    public IActionResult GetHealth()
    {
        var response = new HealthCheckResponse
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffz"),
            Service = "FoodPilot AuthService"
        };
        return Ok(response);
    }
}

/// <summary>
/// Respuesta del health check del servicio.
/// </summary>
public class HealthCheckResponse
{
    /// <summary>
    /// Estado actual del servicio.
    /// </summary>
    /// <example>Healthy</example>
    public string Status { get; set; }

    /// <summary>
    /// Timestamp UTC de la verificación.
    /// </summary>
    /// <example>2025-04-13T10:30:45.123z</example>
    public string Timestamp { get; set; }

    /// <summary>
    /// Nombre del servicio.
    /// </summary>
    /// <example>FoodPilot AuthService</example>
    public string Service { get; set; }
}
 