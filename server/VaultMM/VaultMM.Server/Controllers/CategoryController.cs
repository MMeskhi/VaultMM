using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaultMM.Server.Data;

namespace VaultMM.Server.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CategoryController(VaultDbContext context) : ControllerBase
{
    public class CreateCategoryRequest
    {
        public int VaultId { get; set; }
        public string Name { get; set; } = "";
    }

    public class UpdateCategoryRequest
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

    private IQueryable<Category> MyCategories()
    {
        var vaultIds = MyVaults().Select(vault => vault.Id);

        return context.Categories.Where(category =>
            vaultIds.Contains(category.VaultId));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int vaultId)
    {
        if (!await MyVaults().AnyAsync(vault => vault.Id == vaultId))
            return NotFound();

        var categories = await MyCategories()
            .Where(category => category.VaultId == vaultId)
            .Select(category => new
            {
                id = category.Id,
                vaultId = category.VaultId,
                name = category.Name
            })
            .ToListAsync();

        return Ok(categories);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var category = await MyCategories()
            .Where(category => category.Id == id)
            .Select(category => new
            {
                id = category.Id,
                vaultId = category.VaultId,
                name = category.Name
            })
            .SingleOrDefaultAsync();

        if (category is null)
            return NotFound();

        return Ok(category);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateCategoryRequest request)
    {
        if (!await MyVaults().AnyAsync(vault => vault.Id == request.VaultId))
            return NotFound();

        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Category name is required.");

        var category = new Category
        {
            VaultId = request.VaultId,
            Name = request.Name.Trim()
        };

        context.Categories.Add(category);
        await context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = category.Id }, new
        {
            id = category.Id,
            vaultId = category.VaultId,
            name = category.Name
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id, UpdateCategoryRequest request)
    {
        var category = await MyCategories()
            .SingleOrDefaultAsync(category => category.Id == id);

        if (category is null)
            return NotFound();

        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest("Category name is required.");

        category.Name = request.Name.Trim();

        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var category = await MyCategories()
            .SingleOrDefaultAsync(category => category.Id == id);

        if (category is null)
            return NotFound();

        // Keep the items, but remove their category assignment.
        var items = await context.VaultItems
            .Where(item => item.CategoryId == id)
            .ToListAsync();

        foreach (var item in items)
            item.CategoryId = null;

        context.Categories.Remove(category);
        await context.SaveChangesAsync();

        return NoContent();
    }
}