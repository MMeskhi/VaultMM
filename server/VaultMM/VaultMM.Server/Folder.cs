namespace VaultMM.Server
{
    public class Folder
    {
        public int Id { get; set; }
        public int VaultId { get; set; }
        public Vault? Vault { get; set; }

        public required string Name { get; set; }

        public int? ParentFolderId { get; set; }
        public Folder? ParentFolder { get; set; }
        public List<Folder> SubFolders { get; set; } = [];

        public List<VaultItem> Items { get; set; } = [];
    }
}
