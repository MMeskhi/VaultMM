namespace VaultMM.Server
{
    public class Vault
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User? User { get; set; }

        public required string Name { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public List<VaultItem> Items { get; set; } = [];
        public List<Folder> Folders { get; set; } = [];
        public List<Category> Categories { get; set; } = [];
        public List<Tag> Tags { get; set; } = [];
    }
}
