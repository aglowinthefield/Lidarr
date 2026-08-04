using System;
using System.Collections.Generic;
using System.Linq;
using NLog;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.ThingiProvider.Events;

namespace NzbDrone.Core.ImportLists.Items
{
    public interface IImportListItemService
    {
        List<ImportListItem> GetAll();
        List<ImportListItem> GetForList(int importListId);
        void SyncForList(int importListId, IEnumerable<ImportListItemInfo> items);
    }

    public class ImportListItemService : IImportListItemService, IHandleAsync<ProviderDeletedEvent<IImportList>>
    {
        private readonly IImportListItemRepository _repository;
        private readonly Logger _logger;

        public ImportListItemService(IImportListItemRepository repository, Logger logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public List<ImportListItem> GetAll()
        {
            return _repository.All().ToList();
        }

        public List<ImportListItem> GetForList(int importListId)
        {
            return _repository.GetForList(importListId);
        }

        /// <summary>
        /// Replaces the stored contents of a list with what the latest sync
        /// returned, so removals from the source list are reflected rather than
        /// accumulating forever.
        /// </summary>
        public void SyncForList(int importListId, IEnumerable<ImportListItemInfo> items)
        {
            var discovered = DateTime.UtcNow;

            var mapped = items
                .Where(x => x != null)
                .Select(x => new ImportListItem
                {
                    ImportListId = importListId,
                    Artist = x.Artist,
                    ArtistMusicBrainzId = x.ArtistMusicBrainzId,
                    Album = x.Album,
                    AlbumMusicBrainzId = x.AlbumMusicBrainzId,
                    ReleaseDate = x.ReleaseDate == default ? null : x.ReleaseDate,
                    Discovered = discovered
                })
                .ToList();

            _repository.DeleteForList(importListId);

            if (mapped.Any())
            {
                _repository.InsertMany(mapped);
            }

            _logger.Debug("Recorded {0} items for import list {1}", mapped.Count, importListId);
        }

        public void HandleAsync(ProviderDeletedEvent<IImportList> message)
        {
            _repository.DeleteForList(message.ProviderId);
        }
    }
}
