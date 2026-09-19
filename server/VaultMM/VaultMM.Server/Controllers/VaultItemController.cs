using Microsoft.AspNetCore.Mvc;

namespace VaultMM.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VaultItemController : ControllerBase
    {
        [HttpGet]
        public VaultItem Get()
        {
            return new VaultItem
            {
                Id = 1,
                Title = "Blade Runner 2049",
                Description = "Sci-fi movie",
                Url = "https://www.letterboxd.com/",
                ImageUrl = null,
                VaultId = 1
            };
        }
    }
}
