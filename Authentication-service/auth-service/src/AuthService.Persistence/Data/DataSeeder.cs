using System;
using AuthService.Domain.Entities;
using AuthService.Domain.Constants;
using AuthService.Application.Services;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Persistence.Data;

// Clase para sembrar datos iniciales en la DB
public static class DataSeeder
{
    // Sembrar roles y usuario admin por defecto
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Sembrar roles si no existen
        if (!context.Roles.Any())
        {
            var roles = new List<Role>
            {
                new()
                {
                    Id = UuidGenerator.GenerateRoleId(),
                    Name = RoleConstants.PLATFORM_ADMIN
                },
                new()
                {
                    Id = UuidGenerator.GenerateRoleId(),
                    Name = RoleConstants.RESTAURANT_ADMIN
                },
                new()
                {
                    Id = UuidGenerator.GenerateRoleId(),
                    Name = RoleConstants.CLIENT
                }
            };
            await context.Roles.AddRangeAsync(roles);
            await context.SaveChangesAsync();

        }

        // Sembrar usuario admin si no existen usuarios
        if (!await context.Users.AnyAsync())
        {
            var adminRole = await context.Roles.FirstOrDefaultAsync(r => r.Name == RoleConstants.PLATFORM_ADMIN);
            if (adminRole != null)
            {
                var passwordHasher = new PasswordHashService();
                var userId = UuidGenerator.GenerateUserId();
                var profileId = UuidGenerator.GenerateUserId();
                var emailId = UuidGenerator.GenerateUserId();
                var userRoleId = UuidGenerator.GenerateUserId();

                // Crear usuario admin de prueba
                var adminUser = new User
                {
                    Id = userId,
                    Name = "Test",
                    Surname = "Admin",
                    Username = "testadmin",
                    Email = "testadmin@local.com",
                    Password = passwordHasher.HashPassword("Test123!"),
                    Status = true,

                    UserProfile = new UserProfile
                    {
                        Id = profileId,
                        UserId = userId,
                        Phone = "00000000"
                    },

                    UserEmail = new UserEmail
                    {
                        Id = emailId,
                        UserId = userId,
                        EmailVerified = true,
                        EmailVerificationToken = null,
                        EmailVerificationTokenExpiry = null
                    },

                    UserRoles =
                    [
                        new UserRole
                        {
                            Id = userRoleId,
                            UserId = userId,
                            RoleId = adminRole.Id
                        }
                    ]
                };
                await context.Users.AddAsync(adminUser);
                await context.SaveChangesAsync();
            }
        }
    }
}

