using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaultMM.Server.Data;

namespace VaultMM.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VaultItemController(VaultDbContext context) : ControllerBase
    {
        private readonly VaultDbContext _context = context;


        // GET: api/vaultitem?vaultId=id
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VaultItem>>> GetAll([FromQuery] int vaultId)
        {
            var items = await _context.VaultItems
                .Where(i => i.VaultId == vaultId)
                .Include(i => i.Tags)
                .ToListAsync();

            return Ok(items);
        }

        // GET: api/vaultitem/id
        [HttpGet("{id}")]
        public async Task<ActionResult<VaultItem>> GetById(int id)
        {
            var item = await _context.VaultItems
                .Include(i => i.Tags)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (item == null)
                return NotFound();

            return Ok(item);
        }

        // POST: api/vaultitem
        [HttpPost]
        public async Task<ActionResult<VaultItem>> Create(VaultItem item)
        {
            _context.VaultItems.Add(item);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
        }

        // PUT: api/vaultitem/id
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, VaultItem updatedItem)
        {
            if (id != updatedItem.Id)
                return BadRequest();

            var existing = await _context.VaultItems.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.Title = updatedItem.Title;
            existing.Description = updatedItem.Description;
            existing.Url = updatedItem.Url;
            existing.ImageUrl = updatedItem.ImageUrl;
            existing.FolderId = updatedItem.FolderId;
            existing.CategoryId = updatedItem.CategoryId;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/vaultitem/id
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.VaultItems.FindAsync(id);
            if (item == null)
                return NotFound();

            _context.VaultItems.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
