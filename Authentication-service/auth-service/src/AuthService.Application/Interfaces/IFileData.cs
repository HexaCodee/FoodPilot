namespace AuthService.Application.Interfaces;

// Interfaz para datos de archivo
public interface IFileData
{
    byte[] Data { get; }
    string ContentType { get; }
    string FileName { get; }
    long Size { get; }
}
