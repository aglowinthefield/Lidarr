using System;
using System.Collections.Generic;
using System.Linq;
using Lidarr.Http;
using Lidarr.Http.REST;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Core.ArtistStats;
using NzbDrone.Core.ImportLists;
using NzbDrone.Core.ImportLists.Items;
using NzbDrone.Core.Music;

namespace Lidarr.Api.V1.ImportLists
{
    [V1ApiController]
    public class ImportListItemController : RestController<ImportListItemResource>
    {
        private readonly IImportListItemService _importListItemService;
        private readonly IImportListFactory _importListFactory;
        private readonly IArtistService _artistService;
        private readonly IAlbumService _albumService;
        private readonly IArtistStatisticsService _artistStatisticsService;

        public ImportListItemController(IImportListItemService importListItemService,
            IImportListFactory importListFactory,
            IArtistService artistService,
            IAlbumService albumService,
            IArtistStatisticsService artistStatisticsService)
        {
            _importListItemService = importListItemService;
            _importListFactory = importListFactory;
            _artistService = artistService;
            _albumService = albumService;
            _artistStatisticsService = artistStatisticsService;
        }

        public override ImportListItemResource GetResourceById(int id)
        {
            var item = _importListItemService.GetAll().FirstOrDefault(x => x.Id == id);

            if (item == null)
            {
                return null;
            }

            return MapMany(new List<ImportListItem> { item }).Single();
        }

        [HttpGet]
        public List<ImportListItemResource> GetImportListItems(int? importListId = null)
        {
            var items = importListId.HasValue
                ? _importListItemService.GetForList(importListId.Value)
                : _importListItemService.GetAll();

            return MapMany(items);
        }

        private List<ImportListItemResource> MapMany(List<ImportListItem> items)
        {
            if (!items.Any())
            {
                return new List<ImportListItemResource>();
            }

            var listNames = _importListFactory.All().ToDictionary(x => x.Id, x => x.Name);

            // Resolve the library once per request rather than per row.
            var existingArtists = new HashSet<string>(
                _artistService.GetAllArtists().Select(x => x.ForeignArtistId).Where(x => x != null),
                StringComparer.OrdinalIgnoreCase);

            var albumsByForeignId = _albumService.GetAllAlbums()
                .Where(x => x.ForeignAlbumId != null)
                .GroupBy(x => x.ForeignAlbumId, StringComparer.OrdinalIgnoreCase)
                .ToDictionary(g => g.Key, g => g.First(), StringComparer.OrdinalIgnoreCase);

            // One statistics query covers the whole library; asking per album would
            // be a query per row.
            var trackFileCounts = _artistStatisticsService.ArtistStatistics()
                .Where(x => x.AlbumStatistics != null)
                .SelectMany(x => x.AlbumStatistics)
                .GroupBy(x => x.AlbumId)
                .ToDictionary(g => g.Key, g => g.Sum(x => x.TrackFileCount));

            return items
                .Select(x =>
                {
                    var album = x.AlbumMusicBrainzId == null
                        ? null
                        : albumsByForeignId.GetValueOrDefault(x.AlbumMusicBrainzId);

                    return x.ToResource(
                        listNames.GetValueOrDefault(x.ImportListId),
                        x.ArtistMusicBrainzId != null && existingArtists.Contains(x.ArtistMusicBrainzId),
                        album != null,
                        album?.Monitored ?? false,
                        album != null && trackFileCounts.GetValueOrDefault(album.Id) > 0);
                })
                .ToList();
        }
    }
}
