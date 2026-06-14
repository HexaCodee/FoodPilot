using AuthService.Application.Services;
using AuthService.Domain.Interfaces;
using AuthService.Persistence.Data;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Persistence.Repositories;

// Repositorio de refresh tokens — tabla fuera del modelo de EF Core (raw SQL),
// siguiendo el mismo patrón que UserRepository.UpdateProfilePictureAsync.
public class RefreshTokenRepository(ApplicationDbContext context) : IRefreshTokenRepository
{
    public async Task CreateAsync(string userId, string tokenHash, DateTime expiresAt)
    {
        var connStr = context.Database.GetConnectionString()!;
        await using var conn = new Npgsql.NpgsqlConnection(connStr);
        await conn.OpenAsync();
        await using var cmd = conn.CreateCommand();
        cmd.CommandText =
            "INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at) " +
            "VALUES (@id, @uid, @hash, @exp, now())";
        cmd.Parameters.AddWithValue("@id", UuidGenerator.GenerateRefreshTokenId());
        cmd.Parameters.AddWithValue("@uid", userId);
        cmd.Parameters.AddWithValue("@hash", tokenHash);
        cmd.Parameters.AddWithValue("@exp", expiresAt);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task<string?> GetUserIdForValidTokenAsync(string tokenHash)
    {
        var connStr = context.Database.GetConnectionString()!;
        await using var conn = new Npgsql.NpgsqlConnection(connStr);
        await conn.OpenAsync();
        await using var cmd = conn.CreateCommand();
        cmd.CommandText =
            "SELECT user_id FROM refresh_tokens " +
            "WHERE token_hash = @hash AND revoked_at IS NULL AND expires_at > now() " +
            "LIMIT 1";
        cmd.Parameters.AddWithValue("@hash", tokenHash);

        await using var reader = await cmd.ExecuteReaderAsync();
        if (await reader.ReadAsync())
            return reader.GetString(0);

        return null;
    }

    public async Task RevokeAsync(string tokenHash)
    {
        var connStr = context.Database.GetConnectionString()!;
        await using var conn = new Npgsql.NpgsqlConnection(connStr);
        await conn.OpenAsync();
        await using var cmd = conn.CreateCommand();
        cmd.CommandText =
            "UPDATE refresh_tokens SET revoked_at = now() " +
            "WHERE token_hash = @hash AND revoked_at IS NULL";
        cmd.Parameters.AddWithValue("@hash", tokenHash);
        await cmd.ExecuteNonQueryAsync();
    }
}
