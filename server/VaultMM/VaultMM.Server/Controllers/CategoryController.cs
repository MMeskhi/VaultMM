using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaultMM.Server.Data;

namespace VaultMM.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController(VaultDbContext context) : ControllerBase
    {
        private readonly VaultDbContext _context = context;

        // GET: api/category?vaultId=id
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Category>>> GetAll([FromQuery] int vaultId)
        {
            var categories = await _context.Categories
                .Where(c => c.VaultId == vaultId)
                .ToListAsync();

            return Ok(categories);
        }

        // GET: api/category/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Category>> GetById(int id)
        {
            var category = await _context.Categories
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
                return NotFound();

            return Ok(category);
        }

        // POST: api/category
        [HttpPost]
        public async Task<ActionResult<Category>> Create(Category category)
        {
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
        }

        // PUT: api/category/id
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Category updatedCategory)
        {
            if (id != updatedCategory.Id)
                return BadRequest();

            var existing = await _context.Categories.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.Name = updatedCategory.Name;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/category/id
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound();

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}