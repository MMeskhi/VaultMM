using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaultMM.Server.Data;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace VaultMM.Server.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(VaultDbContext db) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet("google")]
    public IActionResult GoogleLogin()
    {
        var properties = new AuthenticationProperties
        {
            RedirectUri = "http://localhost:5173"
        };

        return Challenge(properties, GoogleDefaults.AuthenticationScheme);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var googleId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(googleId))
            return Unauthorized();

        var user = await db.Users.SingleOrDefaultAsync(
            user => user.GoogleId == googleId);

        if (user is null)
            return Unauthorized();

        return Ok(new
        {
            id = user.Id,
            googleId = user.GoogleId,
            email = user.Email,
            displayName = user.DisplayName
        });
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(
            CookieAuthenticationDefaults.AuthenticationScheme);

        return NoContent();
    }
}