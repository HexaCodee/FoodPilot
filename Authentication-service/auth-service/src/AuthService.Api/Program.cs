using AuthService.Api.Extensions;
using AuthService.Api.Middlewares;
using AuthService.Api.ModelBinders;
using AuthService.Persistence.Data;
using NetEscapades.AspNetCore.SecurityHeaders.Infrastructure;
using Serilog;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.EntityFrameworkCore;

// Crear carpeta wwwroot para fotos de perfil subidas (debe existir antes de CreateBuilder
// para que WebRootPath se configure correctamente)
Directory.CreateDirectory(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profile-pictures"));

var builder = WebApplication.CreateBuilder(args);

// Deshabilitar validación SSL para servicios externos
System.Net.ServicePointManager.ServerCertificateValidationCallback += (sender, certificate, chain, sslPolicyErrors) => true;

// Configurar logging con Serilog
builder.Host.UseSerilog((context, services, loggerConfiguration) =>
    loggerConfiguration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services));

// Agregar controladores con binder para archivos
builder.Services.AddControllers(options =>
{
    // Binder personalizado para datos de archivos
    options.ModelBinderProviders.Insert(0, new FileDataModelBinderProvider());
})
.AddJsonOptions(o =>
{
    // Respuestas en camelCase
    o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});

// Registrar servicios de app, auth, rate limiting, seguridad
builder.Services.AddApiDocumentation();
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddRateLimitingPolicies();
builder.Services.AddSecurityPolicies(builder.Configuration);
builder.Services.AddSecurityOptions();

var app = builder.Build();

// Configurar pipeline HTTP
if (app.Environment.IsDevelopment())
{
    // Habilitar Swagger en desarrollo
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Logging de requests
app.UseSerilogRequestLogging();

// Headers de seguridad
app.UseSecurityHeaders(policies => policies
    .AddDefaultSecurityHeaders()
    .RemoveServerHeader()
    .AddFrameOptionsDeny()
    .AddXssProtectionBlock()
    .AddContentTypeOptionsNoSniff()
    .AddReferrerPolicyStrictOriginWhenCrossOrigin()
    .AddContentSecurityPolicy(builder =>
    {
        builder.AddDefaultSrc().Self();
        builder.AddScriptSrc().Self().UnsafeInline();
        builder.AddStyleSrc().Self().UnsafeInline();
        builder.AddImgSrc().Self().Data();
        builder.AddFontSrc().Self().Data();
        builder.AddConnectSrc().Self();
        builder.AddFrameAncestors().None();
        builder.AddBaseUri().Self();
        builder.AddFormAction().Self();
    })
    .AddCustomHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
    .AddCustomHeader("Cache-Control", "no-store, no-cache, must-revalidate, private")
);

// Middleware para excepciones globales
app.UseMiddleware<GlobalExceptionMiddleware>();

// Middlewares estándar
app.UseHttpsRedirection();
app.UseCors("DefaultCorsPolicy");

// Servir archivos estáticos (fotos de perfil subidas)
app.UseStaticFiles();

app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

// Mapear rutas de controladores
app.MapControllers();

// Log de direcciones al iniciar
var startupLogger = app.Services.GetRequiredService<ILogger<Program>>();
app.Lifetime.ApplicationStarted.Register(() =>
{
    try
    {
        var server = app.Services.GetRequiredService<IServer>();
        var addressesFeature = server.Features.Get<IServerAddressesFeature>();
        var addresses = (IEnumerable<string>?)addressesFeature?.Addresses ?? app.Urls;

        if (addresses != null && addresses.Any())
        {
            foreach (var addr in addresses)
            {
                var health = $"{addr.TrimEnd('/')}/api/v1/health";
                startupLogger.LogInformation("API ejecutándose en {Url}. Health: {HealthUrl}", addr, health);
            }
        }
        else
        {
            startupLogger.LogInformation("API iniciada. Health: /api/v1/health");
        }
    }
    catch (Exception ex)
    {
        startupLogger.LogWarning(ex, "Error al obtener direcciones");
    }
});

// Inicializar DB y seed
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        logger.LogInformation("Verificando DB...");
        // Crear DB si no existe
        await context.Database.EnsureCreatedAsync();

        // Agregar columna profile_picture si no existe (columna añadida después de la creación inicial)
        try
        {
            await context.Database.ExecuteSqlRawAsync(
                "ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255) NOT NULL DEFAULT ''");
            logger.LogInformation("Columna profile_picture verificada correctamente");
        }
        catch (Exception colEx)
        {
            logger.LogWarning(colEx, "No se pudo ejecutar ALTER TABLE para profile_picture — continuando de todas formas");
        }

        // Crear tabla refresh_tokens si no existe (refresh tokens fuera del modelo de EF Core)
        try
        {
            await context.Database.ExecuteSqlRawAsync(
                """
                CREATE TABLE IF NOT EXISTS refresh_tokens (
                    id VARCHAR(16) PRIMARY KEY,
                    user_id VARCHAR(16) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    token_hash VARCHAR(128) NOT NULL,
                    expires_at TIMESTAMPTZ NOT NULL,
                    revoked_at TIMESTAMPTZ NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
                )
                """);
            await context.Database.ExecuteSqlRawAsync(
                "CREATE INDEX IF NOT EXISTS ix_refresh_tokens_token_hash ON refresh_tokens(token_hash)");
            logger.LogInformation("Tabla refresh_tokens verificada correctamente");
        }
        catch (Exception rtEx)
        {
            logger.LogWarning(rtEx, "No se pudo crear la tabla refresh_tokens — continuando de todas formas");
        }

        logger.LogInformation("DB lista. Ejecutando seed...");
        await DataSeeder.SeedAsync(context);

        logger.LogInformation("DB inicializada");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error inicializando DB");
        throw;
    }
}

app.Run();
