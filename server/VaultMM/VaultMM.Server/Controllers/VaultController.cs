using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaultMM.Server.Data;

namespace VaultMM.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VaultController(VaultDbContext context) : ControllerBase
    {
        private readonly VaultDbContext _context = context;

        [HttpPost]
        public async Task<ActionResult<Vault>> Create(Vault vault)
        {
            _context.Vaults.Add(vault);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = vault.Id }, vault);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Vault>> GetById(int id)
        {
            var vault = await _context.Vaults.FindAsync(id);
            if (vault == null) return NotFound();
            return Ok(vault);
        }
    }
}