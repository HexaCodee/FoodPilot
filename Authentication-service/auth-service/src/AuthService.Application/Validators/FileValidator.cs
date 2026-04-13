using AuthService.Application.Interfaces;

namespace AuthService.Application.Validators;

// Validador estático para archivos, especialmente imágenes
public static class FileValidator
{
    // Extensiones permitidas para imágenes
    private static readonly string[] AllowedImageExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    // Tamaño máximo de archivo en bytes (5MB)
    private const int MaxFileSizeInBytes = 5 * 1024 * 1024; // 5MB

    // Validar imagen subida
    public static (bool IsValid, string? ErrorMessage) ValidateImage(IFileData file)
    {
        if (file == null || file.Size == 0)
        {
            return (false, "File is required");
        }

        // Validar tamaño
        if (file.Size > MaxFileSizeInBytes)
        {
            return (false, $"File size cannot exceed {MaxFileSizeInBytes / (1024 * 1024)}MB");
        }

        // Validar extensión
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedImageExtensions.Contains(extension))
        {
            return (false, $"Only the following file types are allowed: {string.Join(", ", AllowedImageExtensions)}");
        }

        // Validar content type
        var allowedContentTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };
        if (!allowedContentTypes.Contains(file.ContentType.ToLowerInvariant()))
        {
            return (false, "Invalid file type");
        }

        return (true, null);
    }

    // Generar nombre seguro para archivo
    public static string GenerateSecureFileName(string originalFileName)
    {
        var extension = Path.GetExtension(originalFileName).ToLowerInvariant();
        var uniqueId = Guid.NewGuid().ToString("N")[..12]; // 12 caracteres únicos
        return $"profile-{uniqueId}{extension}";
    }
}