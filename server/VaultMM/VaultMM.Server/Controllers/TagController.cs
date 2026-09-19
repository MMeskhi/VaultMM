using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaultMM.Server.Data;

namespace VaultMM.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TagController(VaultDbContext context) : ControllerBase
    {
        private readonly VaultDbContext _context = context;

        // GET: api/tag?vaultId=id
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Tag>>> GetAll([FromQuery] int vaultId)
        {
            var tags = await _context.Tags
                .Where(t => t.VaultId == vaultId)
                .ToListAsync();

            return Ok(tags);
        }

        // GET: api/tag/id
        [HttpGet("{id}")]
        public async Task<ActionResult<Tag>> GetById(int id)
        {
            var tag = await _context.Tags
                .Include(t => t.Items)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (tag == null)
                return NotFound();

            return Ok(tag);
        }

        // POST: api/tag
        [HttpPost]
        public async Task<ActionResult<Tag>> Create(Tag tag)
        {
            _context.Tags.Add(tag);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = tag.Id }, tag);
        }

        // PUT: api/tag/id
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Tag updatedTag)
        {
            if (id != updatedTag.Id)
                return BadRequest();

            var existing = await _context.Tags.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.Name = updatedTag.Name;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/tag/id
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var tag = await _context.Tags.FindAsync(id);
            if (tag == null)
                return NotFound();

            _context.Tags.Remove(tag);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}