using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaultMM.Server.Data;
using VaultMM.Server.DTOs;

namespace VaultMM.Server.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class VaultItemController(VaultDbContext context) : ControllerBase
{
    private IQueryable<Vault> MyVaults()
    {
        var googleId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return context.Vaults.Where(vault =>
            googleId != null &&
            vault.User != null &&
            vault.User.GoogleId == googleId);
    }

    private IQueryable<VaultItem> MyItems()
    {
        var vaultIds = MyVaults().Select(vault => vault.Id);

        return context.VaultItems.Where(item =>
            vaultIds.Contains(item.VaultId));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VaultItem>>> GetAll(
        [FromQuery] int vaultId)
    {
        if (!await MyVaults().AnyAsync(vault => vault.Id == vaultId))
            return NotFound();

        var items = await MyItems()
            .Where(item => item.VaultId == vaultId)
            .Include(item => item.Tags)
            .ToListAsync();

        return Ok(items.Select(ToResponse));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<VaultItem>> GetById(int id)
    {
        var item = await MyItems()
            .Include(item => item.Tags)
            .FirstOrDefaultAsync(item => item.Id == id);

        if (item is null)
            return NotFound();

        return Ok(ToResponse(item));
    }

    [HttpPost]
    public async Task<ActionResult<VaultItem>> Create(
        CreateVaultItemRequest request)
    {
        if (!await MyVaults().AnyAsync(vault => vault.Id == request.VaultId))
            return NotFound();

        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest("Title is required.");

        if (request.FolderId is int folderId &&
            !await context.Folders.AnyAsync(folder => folder.Id == folderId && folder.VaultId == request.VaultId))
            return BadRequest("Folder must belong to this vault.");

        if (request.CategoryId is int categoryId &&
            !await context.Categories.AnyAsync(category => category.Id == categoryId && category.VaultId == request.VaultId))
            return BadRequest("Category must belong to this vault.");

        var tagIds = request.TagIds.Distinct().ToList();
        var tags = await context.Tags.Where(tag => tag.VaultId == request.VaultId && tagIds.Contains(tag.Id)).ToListAsync();
        if (tags.Count != tagIds.Count) return BadRequest("Tags must belong to this vault.");

        if (!IsSafeUrl(request.Url) || !IsSafeUrl(request.ImageUrl))
            return BadRequest("Links must use http or https.");

        var item = new VaultItem
        {
            Title = request.Title.Trim(),
            Description = request.Description?.Trim(),
            VaultId = request.VaultId,
            Url = request.Url?.Trim(),
            ImageUrl = request.ImageUrl?.Trim(),
            FolderId = request.FolderId,
            CategoryId = request.CategoryId,
            Tags = tags
        };

        context.VaultItems.Add(item);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = item.Id }, ToResponse(item));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, VaultItem updatedItem)
    {
        if (id != updatedItem.Id)
            return BadRequest();

        var existing = await MyItems()
            .Include(item => item.Tags)
            .FirstOrDefaultAsync(item => item.Id == id);

        if (existing is null)
            return NotFound();

        if (string.IsNullOrWhiteSpace(updatedItem.Title))
            return BadRequest("Title is required.");

        if (updatedItem.FolderId is int folderId &&
            !await context.Folders.AnyAsync(folder =>
                folder.Id == folderId &&
                folder.VaultId == existing.VaultId))
        {
            return BadRequest("Folder must belong to this vault.");
        }

        if (updatedItem.CategoryId is int categoryId &&
            !await context.Categories.AnyAsync(category =>
                category.Id == categoryId &&
                category.VaultId == existing.VaultId))
        {
            return BadRequest("Category must belong to this vault.");
        }

        if (!IsSafeUrl(updatedItem.Url) || !IsSafeUrl(updatedItem.ImageUrl))
            return BadRequest("Links must use http or https.");

        var tagIds = updatedItem.Tags.Select(tag => tag.Id).Distinct().ToList();
        var tags = await context.Tags.Where(tag => tag.VaultId == existing.VaultId && tagIds.Contains(tag.Id)).ToListAsync();
        if (tags.Count != tagIds.Count) return BadRequest("Tags must belong to this vault.");
        existing.Title = updatedItem.Title.Trim();
        existing.Tags.Clear();
        foreach (var tag in tags) existing.Tags.Add(tag);
        existing.Description = updatedItem.Description?.Trim();
        existing.Url = updatedItem.Url;
        existing.ImageUrl = updatedItem.ImageUrl;
        existing.FolderId = updatedItem.FolderId;
        existing.CategoryId = updatedItem.CategoryId;

        await context.SaveChangesAsync();
        return NoContent();
    }

    private static bool IsSafeUrl(string? value) =>
        string.IsNullOrWhiteSpace(value) ||
        (Uri.TryCreate(value.Trim(), UriKind.Absolute, out var uri) &&
         (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps));

    // Return only item data; EF navigation properties can form serialization cycles.
    private static object ToResponse(VaultItem item) => new
    {
        id = item.Id,
        vaultId = item.VaultId,
        title = item.Title,
        description = item.Description,
        url = item.Url,
        imageUrl = item.ImageUrl,
        folderId = item.FolderId,
        categoryId = item.CategoryId,
        createdAt = item.CreatedAt,
        tags = item.Tags.Select(tag => new { id = tag.Id, vaultId = tag.VaultId, name = tag.Name })
    };

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await MyItems()
            .FirstOrDefaultAsync(item => item.Id == id);

        if (item is null)
            return NotFound();

        context.VaultItems.Remove(item);
        await context.SaveChangesAsync();

        return NoContent();
    }
}
