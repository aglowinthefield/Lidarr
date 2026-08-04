using System.Collections.Generic;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Messaging.Events;

namespace NzbDrone.Core.ImportLists.Items
{
    public interface IImportListItemRepository : IBasicRepository<ImportListItem>
    {
        List<ImportListItem> GetForList(int importListId);
        void DeleteForList(int importListId);
    }

    public class ImportListItemRepository : BasicRepository<ImportListItem>, IImportListItemRepository
    {
        public ImportListItemRepository(IMainDatabase database, IEventAggregator eventAggregator)
            : base(database, eventAggregator)
        {
        }

        public List<ImportListItem> GetForList(int importListId)
        {
            return Query(x => x.ImportListId == importListId);
        }

        public void DeleteForList(int importListId)
        {
            Delete(x => x.ImportListId == importListId);
        }
    }
}
