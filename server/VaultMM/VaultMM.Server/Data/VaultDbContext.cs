using Microsoft.EntityFrameworkCore;

namespace VaultMM.Server.Data
{
    public class VaultDbContext(DbContextOptions<VaultDbContext> options) : DbContext(options)
    {
        public DbSet<User> Users => Set<User>();
        public DbSet<Vault> Vaults => Set<Vault>();
        public DbSet<Folder> Folders => Set<Folder>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Tag> Tags => Set<Tag>();
        public DbSet<VaultItem> VaultItems => Set<VaultItem>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Folder self-reference: prevent cascade delete cycles
            modelBuilder.Entity<Folder>()
                .HasOne(f => f.ParentFolder)
                .WithMany(f => f.SubFolders)
                .HasForeignKey(f => f.ParentFolderId)
                .OnDelete(DeleteBehavior.Restrict);

            // VaultItem <-> Tag many-to-many (EF Core auto-creates the join table)
            modelBuilder.Entity<VaultItem>()
                .HasMany(i => i.Tags)
                .WithMany(t => t.Items);
        }
    }
}