using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaultMM.Server.Data;

namespace VaultMM.Server.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class UserController(VaultDbContext context) : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var googleId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(googleId))
            return Unauthorized();

        var user = await context.Users
            .Where(user => user.Id == id && user.GoogleId == googleId)
            .Select(user => new
            {
                id = user.Id,
                email = user.Email,
                displayName = user.DisplayName
            })
            .SingleOrDefaultAsync();

        if (user is null)
            return NotFound();

        return Ok(user);
    }
}