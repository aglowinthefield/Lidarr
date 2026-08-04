using System;
using Lidarr.Http.REST;
using NzbDrone.Core.ImportLists.Items;

namespace Lidarr.Api.V1.ImportLists
{
    public class ImportListItemResource : RestResource
    {
        public int ImportListId { get; set; }
        public string ImportList { get; set; }
        public string Artist { get; set; }
        public string ArtistMusicBrainzId { get; set; }
        public string Album { get; set; }
        public string AlbumMusicBrainzId { get; set; }
        public DateTime? ReleaseDate { get; set; }
        public DateTime Discovered { get; set; }

        // Adding an artist creates album rows for their whole discography, so an
        // existing album row only means Lidarr knows about it - not that the music
        // is here. HasFile is what actually separates "have it" from "want it".
        public bool IsExistingArtist { get; set; }
        public bool IsExistingAlbum { get; set; }
        public bool IsMonitored { get; set; }
        public bool HasFile { get; set; }
    }

    public static class ImportListItemResourceMapper
    {
        public static ImportListItemResource ToResource(this ImportListItem model, string listName, bool existingArtist, bool existingAlbum, bool monitored, bool hasFile)
        {
            if (model == null)
            {
                return null;
            }

            return new ImportListItemResource
            {
                Id = model.Id,
                ImportListId = model.ImportListId,
                ImportList = listName,
                Artist = model.Artist,
                ArtistMusicBrainzId = model.ArtistMusicBrainzId,
                Album = model.Album,
                AlbumMusicBrainzId = model.AlbumMusicBrainzId,
                ReleaseDate = model.ReleaseDate,
                Discovered = model.Discovered,
                IsExistingArtist = existingArtist,
                IsExistingAlbum = existingAlbum,
                IsMonitored = monitored,
                HasFile = hasFile
            };
        }
    }
}
