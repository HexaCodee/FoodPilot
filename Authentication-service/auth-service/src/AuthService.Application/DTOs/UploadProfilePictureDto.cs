using AuthService.Application.Interfaces;

namespace AuthService.Application.DTOs;

public class UploadProfilePictureDto
{
    public IFileData? ProfilePicture { get; set; }
}
