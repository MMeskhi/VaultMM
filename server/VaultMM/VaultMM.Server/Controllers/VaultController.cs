using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaultMM.Server.Data;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace VaultMM.Server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class VaultController(VaultDbContext context) : ControllerBase
    {
        private readonly VaultDbContext _context = context;

        [HttpPost]
        public async Task<IActionResult> Create(CreateVaultRequest request)
        {
            var googleId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(googleId))
                return Unauthorized();

            var userId = await _context.Users
                .Where(user => user.GoogleId == googleId)
                .Select(user => (int?)user.Id)
                .SingleOrDefaultAsync();

            if (userId is null)
                return Unauthorized();

            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest("Vault name is required.");

            var vault = new Vault
            {
                UserId = userId.Value,
                Name = request.Name.Trim(),
                Description = request.Description?.Trim()
            };

            _context.Vaults.Add(vault);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = vault.Id }, new
            {
                id = vault.Id,
                name = vault.Name,
                description = vault.Description
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var googleId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(googleId))
                return Unauthorized();

            var vault = await _context.Vaults
                .Where(vault =>
                    vault.Id == id &&
                    vault.User != null &&
                    vault.User.GoogleId == googleId)
                .Select(vault => new
                {
                    id = vault.Id,
                    name = vault.Name,
                    description = vault.Description
                })
                .SingleOrDefaultAsync();

            if (vault is null)
                return NotFound();

            return Ok(vault);
        }

        [Authorize]
        [HttpPost("mine")]
        public async Task<IActionResult> GetOrCreateMyVault()
        {
            var googleId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(googleId))
                return Unauthorized();

            var user = await _context.Users.SingleOrDefaultAsync(
                user => user.GoogleId == googleId);

            if (user is null)
                return Unauthorized();

            // Serialize creation so simultaneous requests reuse the same vault.
            await using var transaction =
                await _context.Database.BeginTransactionAsync();

            var vault = await _context.Vaults
                .Where(vault => vault.UserId == user.Id)
                .OrderBy(vault => vault.Id)
                .FirstOrDefaultAsync();

            if (vault is null)
            {
                vault = new Vault
                {
                    UserId = user.Id,
                    Name = "My Vault"
                };

                _context.Vaults.Add(vault);
                await _context.SaveChangesAsync();
            }

            await transaction.CommitAsync();

            return Ok(new
            {
                id = vault.Id,
                name = vault.Name
            });
        }

        public class CreateVaultRequest
        {
            public string Name { get; set; } = "";
            public string? Description { get; set; }
        }
    }
}