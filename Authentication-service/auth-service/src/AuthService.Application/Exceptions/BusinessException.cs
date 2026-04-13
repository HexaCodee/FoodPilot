namespace AuthService.Application.Exceptions;

// Excepción personalizada para errores de negocio
public class BusinessException : Exception
{
    public string ErrorCode { get; }

    // Constructor con código de error y mensaje
    public BusinessException(string errorCode, string message) : base(message)
    {
        ErrorCode = errorCode;
    }

    // Constructor con código de error, mensaje y excepción interna
    public BusinessException(string errorCode, string message, Exception innerException)
        : base(message, innerException)
    {
        ErrorCode = errorCode;
    }
}
