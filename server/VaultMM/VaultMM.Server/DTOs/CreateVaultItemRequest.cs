using System.ComponentModel.DataAnnotations;

namespace VaultMM.Server.DTOs;

public class CreateVaultItemRequest
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = "";

    [StringLength(2000)]
    public string? Description { get; set; }

    [Range(1, int.MaxValue)]
    public int VaultId { get; set; }

    [StringLength(2000)]
    public string? Url { get; set; }

    [StringLength(2000)]
    public string? ImageUrl { get; set; }

    public int? FolderId { get; set; }
    public int? CategoryId { get; set; }
    public List<int> TagIds { get; set; } = [];
}
