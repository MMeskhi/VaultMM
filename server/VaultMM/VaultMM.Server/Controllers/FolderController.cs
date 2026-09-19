using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaultMM.Server.Data;

namespace VaultMM.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FolderController(VaultDbContext context) : ControllerBase
    {
        private readonly VaultDbContext _context = context;

        // GET: api/folder?vaultId=id
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Folder>>> GetAll([FromQuery] int vaultId)
        {
            var folders = await _context.Folders
                .Where(f => f.VaultId == vaultId)
                .ToListAsync();

            return Ok(folders);
        }

        // GET: api/folder/id
        [HttpGet("{id}")]
        public async Task<ActionResult<Folder>> GetById(int id)
        {
            var folder = await _context.Folders
                .Include(f => f.SubFolders)
                .Include(f => f.Items)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (folder == null)
                return NotFound();

            return Ok(folder);
        }

        // POST: api/folder
        [HttpPost]
        public async Task<ActionResult<Folder>> Create(Folder folder)
        {
            _context.Folders.Add(folder);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = folder.Id }, folder);
        }

        // PUT: api/folder/id
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Folder updatedFolder)
        {
            if (id != updatedFolder.Id)
                return BadRequest();

            var existing = await _context.Folders.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.Name = updatedFolder.Name;
            existing.ParentFolderId = updatedFolder.ParentFolderId;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/folder/id
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var folder = await _context.Folders.FindAsync(id);
            if (folder == null)
                return NotFound();

            _context.Folders.Remove(folder);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}