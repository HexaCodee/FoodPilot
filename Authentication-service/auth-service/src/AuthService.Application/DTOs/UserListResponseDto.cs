namespace AuthService.Application.DTOs;

public class UserListResponseDto
{
    public IReadOnlyList<UserResponseDto> Users { get; set; } = [];
    public int Total { get; set; }
    public int Page { get; set; }
    public int Limit { get; set; }
    public int TotalPages { get; set; }
}
