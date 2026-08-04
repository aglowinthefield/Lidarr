using FluentMigrator;
using NzbDrone.Core.Datastore.Migration.Framework;

namespace NzbDrone.Core.Datastore.Migration
{
    // Numbered well clear of upstream's sequence: this migration is fork-only, so
    // leaving it at 082 would collide the moment upstream adds an 082 of their own.
    [Migration(900)]
    public class add_import_list_items : NzbDroneMigrationBase
    {
        protected override void MainDbUpgrade()
        {
            // Records what each import list returned on its last sync, so the
            // contents of a list can be inspected rather than inferred from
            // whatever it happened to add to the library.
            Create.TableForModel("ImportListItems")
                  .WithColumn("ImportListId").AsInt32().NotNullable()
                  .WithColumn("ArtistMusicBrainzId").AsString().Nullable()
                  .WithColumn("Artist").AsString().Nullable()
                  .WithColumn("AlbumMusicBrainzId").AsString().Nullable()
                  .WithColumn("Album").AsString().Nullable()
                  .WithColumn("ReleaseDate").AsDateTime().Nullable()
                  .WithColumn("Discovered").AsDateTimeOffset().NotNullable();

            Create.Index().OnTable("ImportListItems").OnColumn("ImportListId").Ascending();
        }
    }
}
