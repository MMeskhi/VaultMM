namespace VaultMM.Server
{
    public class VaultItem
    {
        public int Id { get; set; }

        public required string Title { get; set; }

        public string? Description { get; set; }

        public string? Url { get; set; }

        public string? ImageUrl { get; set; }

        public int VaultId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }
}
