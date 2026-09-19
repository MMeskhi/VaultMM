namespace VaultMM.Server
{
    public class User
    {
        public int Id { get; set; }
        public required string GoogleId { get; set; }
        public required string Email { get; set; }
        public string? DisplayName { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public List<Vault> Vaults { get; set; } = [];
    }
}
