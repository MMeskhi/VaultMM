namespace VaultMM.Server
{
    public class VaultItem
    {
        public int Id { get; set; }
        public int VaultId { get; set; }
        public Vault? Vault { get; set; }

        public int? FolderId { get; set; }
        public Folder? Folder { get; set; }

        public int? CategoryId { get; set; }
        public Category? Category { get; set; }

        public required string Title { get; set; }
        public string? Description { get; set; }
        public string? Url { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public List<Tag> Tags { get; set; } = [];
    }
}
