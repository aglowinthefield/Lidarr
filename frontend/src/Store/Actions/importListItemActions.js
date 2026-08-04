import { createAction } from 'redux-actions';
import { filterTypes, sortDirections } from 'Helpers/Props';
import { createThunk, handleThunks } from 'Store/thunks';
import translate from 'Utilities/String/translate';
import createFetchHandler from './Creators/createFetchHandler';
import createHandleActions from './Creators/createHandleActions';
import createClearReducer from './Creators/Reducers/createClearReducer';
import createSetClientSideCollectionFilterReducer from './Creators/Reducers/createSetClientSideCollectionFilterReducer';
import createSetClientSideCollectionSortReducer from './Creators/Reducers/createSetClientSideCollectionSortReducer';
import createSetTableOptionReducer from './Creators/Reducers/createSetTableOptionReducer';

//
// Variables

export const section = 'importListItems';

//
// State

export const defaultState = {
  isFetching: false,
  isPopulated: false,
  sortKey: 'artist',
  sortDirection: sortDirections.ASCENDING,
  error: null,
  items: [],

  columns: [
    {
      name: 'importList',
      label: () => translate('ImportList'),
      isSortable: true,
      isVisible: true
    },
    {
      name: 'artist',
      label: () => translate('Artist'),
      isSortable: true,
      isVisible: true
    },
    {
      name: 'album',
      label: () => translate('Album'),
      isSortable: true,
      isVisible: true
    },
    {
      name: 'releaseDate',
      label: () => translate('ReleaseDate'),
      isSortable: true,
      isVisible: true
    },
    {
      name: 'status',
      label: () => translate('Status'),
      isSortable: true,
      isVisible: true
    },
    {
      name: 'discovered',
      label: () => translate('ImportListItemsDiscovered'),
      isSortable: true,
      isVisible: false
    }
  ],

  // Default to hiding what's already on disk: the useful question is what a list
  // wanted that you still don't have.
  selectedFilterKey: 'wanted',

  filters: [
    {
      key: 'all',
      label: () => translate('All'),
      filters: []
    },
    {
      key: 'wanted',
      label: () => translate('ImportListItemsWanted'),
      filters: [{ key: 'wanted', value: true, type: filterTypes.EQUAL }]
    },
    {
      key: 'missing',
      label: () => translate('ImportListItemsMissingFiles'),
      filters: [{ key: 'hasFile', value: false, type: filterTypes.EQUAL }]
    },
    {
      key: 'inLibrary',
      label: () => translate('ImportListItemsInLibrary'),
      filters: [{ key: 'hasFile', value: true, type: filterTypes.EQUAL }]
    },
    {
      key: 'notAdded',
      label: () => translate('ImportListItemsNotAdded'),
      filters: [{ key: 'isExistingAlbum', value: false, type: filterTypes.EQUAL }]
    }
  ],

  filterPredicates: {
    // Monitored and not on disk - the things still worth chasing.
    wanted: function(item, value) {
      return (!item.hasFile && item.isMonitored) === value;
    }
  },

  sortPredicates: {
    // Sort by how far along an item is rather than by two separate booleans,
    // so the rows that still need attention group together.
    status: function(item) {
      if (item.isExistingAlbum) {
        return 2;
      }

      return item.isExistingArtist ? 1 : 0;
    }
  }
};

export const persistState = [
  'importListItems.sortKey',
  'importListItems.sortDirection',
  'importListItems.selectedFilterKey',
  'importListItems.columns'
];

//
// Actions Types

export const FETCH_IMPORT_LIST_ITEMS = 'importListItems/fetchImportListItems';
export const CLEAR_IMPORT_LIST_ITEMS = 'importListItems/clearImportListItems';
export const SET_IMPORT_LIST_ITEMS_SORT = 'importListItems/setImportListItemsSort';
export const SET_IMPORT_LIST_ITEMS_TABLE_OPTION = 'importListItems/setImportListItemsTableOption';
export const SET_IMPORT_LIST_ITEMS_FILTER = 'importListItems/setImportListItemsFilter';

//
// Action Creators

export const fetchImportListItems = createThunk(FETCH_IMPORT_LIST_ITEMS);
export const clearImportListItems = createAction(CLEAR_IMPORT_LIST_ITEMS);
export const setImportListItemsSort = createAction(SET_IMPORT_LIST_ITEMS_SORT);
export const setImportListItemsTableOption = createAction(SET_IMPORT_LIST_ITEMS_TABLE_OPTION);
export const setImportListItemsFilter = createAction(SET_IMPORT_LIST_ITEMS_FILTER);

//
// Action Handlers

export const actionHandlers = handleThunks({
  [FETCH_IMPORT_LIST_ITEMS]: createFetchHandler(section, '/importlistitem')
});

//
// Reducers

export const reducers = createHandleActions({

  [SET_IMPORT_LIST_ITEMS_SORT]: createSetClientSideCollectionSortReducer(section),
  [SET_IMPORT_LIST_ITEMS_TABLE_OPTION]: createSetTableOptionReducer(section),
  [SET_IMPORT_LIST_ITEMS_FILTER]: createSetClientSideCollectionFilterReducer(section),

  [CLEAR_IMPORT_LIST_ITEMS]: createClearReducer(section, {
    isFetching: false,
    isPopulated: false,
    error: null,
    items: []
  })

}, defaultState, section);
