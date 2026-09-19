namespace VaultMM.Server
{
    public class Tag
    {
        public int Id { get; set; }
        public int VaultId { get; set; }
        public Vault? Vault { get; set; }

        public required string Name { get; set; }

        public List<VaultItem> Items { get; set; } = [];
    }
}
