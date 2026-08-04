using System;
using NzbDrone.Core.Datastore;

namespace NzbDrone.Core.ImportLists.Items
{
    /// <summary>
    /// One entry returned by an import list on its most recent sync. Lidarr acts
    /// on list results and then forgets them, which leaves no way to see what a
    /// list actually contains; these rows are that record.
    /// </summary>
    public class ImportListItem : ModelBase
    {
        public int ImportListId { get; set; }
        public string ArtistMusicBrainzId { get; set; }
        public string Artist { get; set; }
        public string AlbumMusicBrainzId { get; set; }
        public string Album { get; set; }
        public DateTime? ReleaseDate { get; set; }
        public DateTime Discovered { get; set; }
    }
}
