using System;
using Microsoft.AspNetCore.Mvc;
 
namespace AuthService.Api.Controllers;
 
// Controlador para endpoint de salud
[ApiController]
[Route("api/v1/[controller]")]
public class HealthController : ControllerBase
{
    // Endpoint GET para verificar estado del servicio
    [HttpGet]
    public IActionResult GetHealth()
    {
        var response = new
        {
            status = "Healthy",
            timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffz"),
            service = "FoodPilot AuthService"
        };
        return Ok(response);
    }
}
 