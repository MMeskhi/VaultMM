using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaultMM.Server.Data;

namespace VaultMM.Server.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TagController(VaultDbContext context) : ControllerBase
{
    public class CreateTagRequest
    {
        public int VaultId { get; set; }
        public string Name { get; set; } = "";
    }

    public class UpdateTagRequest
    {
        public string Name { get; set; } = "";
    }

    private IQueryable<Vault> MyVaults()
    {
        var googleId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return context.Vaults.Where(vault =>
            googleId != null &&
            vault.User != null &&
            vault.User.GoogleId == googleId);
    }

    private IQueryable<Tag> MyTags()
    {
        var vaultIds = MyVaults().Select(vault => vault.Id);

        return context.Tags.Where(tag =>
            vaultIds.Contains(tag.VaultId));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int vaultId)
    {
        if (!await MyVaults().AnyAsync(vault => vault.Id == vaultId))
            return NotFound();

        var tags = await MyTags()
            .Where(tag => tag.VaultId == vaultId)
            .Select(tag => new
            {
                id = tag.Id,
                vaultId = tag.VaultId,
                name = tag.Name
            })
            .ToListAsync();

        return Ok(tags);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var tag = await MyTags()
            .Where(tag => tag.Id == id)
            .Select(tag => new
            {
                id = tag.Id,
                vaultId = tag.VaultId,
                name = tag.Name
            })
            .SingleOrDefaultAsync();

        if (tag is null)
            return NotFound();

        return Ok(tag);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateTagRequest request)
    {
        if (!await MyVaults().AnyAsync(vault => vault.Id == request.VaultId))
            return NotFound();

        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Tag name is required.");

        var tag = new Tag
        {
            VaultId = request.VaultId,
            Name = request.Name.Trim()
        };

        context.Tags.Add(tag);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = tag.Id }, new
        {
            id = tag.Id,
            vaultId = tag.VaultId,
            name = tag.Name
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateTagRequest request)
    {
        var tag = await MyTags()
            .SingleOrDefaultAsync(tag => tag.Id == id);

        if (tag is null)
            return NotFound();

        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Tag name is required.");

        tag.Name = request.Name.Trim();

        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var tag = await MyTags()
            .Include(tag => tag.Items)
            .SingleOrDefaultAsync(tag => tag.Id == id);

        if (tag is null)
            return NotFound();

        // Remove tag assignments while preserving the items.
        tag.Items.Clear();
        context.Tags.Remove(tag);

        await context.SaveChangesAsync();
        return NoContent();
    }
}