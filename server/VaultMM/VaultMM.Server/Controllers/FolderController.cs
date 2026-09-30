using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaultMM.Server.Data;

namespace VaultMM.Server.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class FolderController(VaultDbContext context) : ControllerBase
{
    public class CreateFolderRequest
    {
        public int VaultId { get; set; }
        public string Name { get; set; } = "";
        public int? ParentFolderId { get; set; }
    }

    public class UpdateFolderRequest
    {
        public string Name { get; set; } = "";
        public int? ParentFolderId { get; set; }
    }

    private IQueryable<Vault> MyVaults()
    {
        var googleId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        return context.Vaults.Where(vault =>
            googleId != null &&
            vault.User != null &&
            vault.User.GoogleId == googleId);
    }

    private IQueryable<Folder> MyFolders()
    {
        var vaultIds = MyVaults().Select(vault => vault.Id);

        return context.Folders.Where(folder =>
            vaultIds.Contains(folder.VaultId));
    }

    private async Task<bool> IsValidParent(
        int vaultId, int? parentId, int? folderId = null)
    {
        var visited = new HashSet<int>();

        while (parentId is int currentId)
        {
            // Reject self-parenting, descendants, and existing cycles.
            if (currentId == folderId || !visited.Add(currentId))
                return false;

            var parent = await MyFolders()
                .Where(folder =>
                    folder.Id == currentId &&
                    folder.VaultId == vaultId)
                .Select(folder => new { folder.ParentFolderId })
                .SingleOrDefaultAsync();

            if (parent is null)
                return false;

            parentId = parent.ParentFolderId;
        }

        return true;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int vaultId)
    {
        if (!await MyVaults().AnyAsync(vault => vault.Id == vaultId))
            return NotFound();

        var folders = await MyFolders()
            .Where(folder => folder.VaultId == vaultId)
            .Select(folder => new
            {
                id = folder.Id,
                vaultId = folder.VaultId,
                name = folder.Name,
                parentFolderId = folder.ParentFolderId
            })
            .ToListAsync();

        return Ok(folders);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var folder = await MyFolders()
            .Where(folder => folder.Id == id)
            .Select(folder => new
            {
                id = folder.Id,
                vaultId = folder.VaultId,
                name = folder.Name,
                parentFolderId = folder.ParentFolderId
            })
            .SingleOrDefaultAsync();

        if (folder is null)
            return NotFound();

        return Ok(folder);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateFolderRequest request)
    {
        if (!await MyVaults().AnyAsync(vault => vault.Id == request.VaultId))
            return NotFound();

        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Folder name is required.");

        await using var transaction =
            await context.Database.BeginTransactionAsync();

        if (!await IsValidParent(request.VaultId, request.ParentFolderId))
            return BadRequest("Parent folder must belong to this vault.");

        var folder = new Folder
        {
            VaultId = request.VaultId,
            Name = request.Name.Trim(),
            ParentFolderId = request.ParentFolderId
        };

        context.Folders.Add(folder);
        await context.SaveChangesAsync();
        await transaction.CommitAsync();

        return CreatedAtAction(nameof(GetById), new { id = folder.Id }, new
        {
            id = folder.Id,
            vaultId = folder.VaultId,
            name = folder.Name,
            parentFolderId = folder.ParentFolderId
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id, UpdateFolderRequest request)
    {
        await using var transaction =
            await context.Database.BeginTransactionAsync();

        var folder = await MyFolders()
            .SingleOrDefaultAsync(folder => folder.Id == id);

        if (folder is null)
            return NotFound();

        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Folder name is required.");

        if (!await IsValidParent(
            folder.VaultId, request.ParentFolderId, folder.Id))
        {
            return BadRequest(
                "Parent must belong to this vault and cannot create a cycle.");
        }

        folder.Name = request.Name.Trim();
        folder.ParentFolderId = request.ParentFolderId;

        await context.SaveChangesAsync();
        await transaction.CommitAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await using var transaction =
            await context.Database.BeginTransactionAsync();

        var folder = await MyFolders()
            .SingleOrDefaultAsync(folder => folder.Id == id);

        if (folder is null)
            return NotFound();

        if (await context.Folders.AnyAsync(
            child => child.ParentFolderId == id))
        {
            return Conflict("Move or delete this folder's subfolders first.");
        }

        // Preserve items by removing their folder assignment.
        var items = await context.VaultItems
            .Where(item => item.FolderId == id)
            .ToListAsync();

        foreach (var item in items)
            item.FolderId = null;

        context.Folders.Remove(folder);
        await context.SaveChangesAsync();
        await transaction.CommitAsync();

        return NoContent();
    }
}