import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import * as commandNames from 'Commands/commandNames';
import { executeCommand } from 'Store/Actions/commandActions';
import {
  fetchImportListItems,
  setImportListItemsFilter,
  setImportListItemsSort,
  setImportListItemsTableOption
} from 'Store/Actions/importListItemActions';
import createClientSideCollectionSelector from 'Store/Selectors/createClientSideCollectionSelector';
import createCommandExecutingSelector from 'Store/Selectors/createCommandExecutingSelector';
import ImportListItems from './ImportListItems';

function createMapStateToProps() {
  return createSelector(
    createClientSideCollectionSelector('importListItems'),
    createCommandExecutingSelector(commandNames.IMPORT_LIST_SYNC),
    (importListItems, isSyncing) => {
      return {
        ...importListItems,
        isSyncing
      };
    }
  );
}

function createMapDispatchToProps(dispatch) {
  return {
    dispatchFetchImportListItems() {
      dispatch(fetchImportListItems());
    },

    onTableOptionChange(payload) {
      dispatch(setImportListItemsTableOption(payload));
    },

    onSortPress(sortKey) {
      dispatch(setImportListItemsSort({ sortKey }));
    },

    onFilterSelect(selectedFilterKey) {
      dispatch(setImportListItemsFilter({ selectedFilterKey }));
    },

    onSyncPress() {
      dispatch(executeCommand({
        name: commandNames.IMPORT_LIST_SYNC
      }));
    }
  };
}

class ImportListItemsConnector extends Component {

  //
  // Lifecycle

  componentDidMount() {
    this.props.dispatchFetchImportListItems();
  }

  componentDidUpdate(prevProps) {
    // A sync rewrites every list's contents, so pull the new rows in once it
    // finishes rather than leaving stale ones on screen.
    if (prevProps.isSyncing && !this.props.isSyncing) {
      this.props.dispatchFetchImportListItems();
    }
  }

  //
  // Listeners

  onRefreshPress = () => {
    this.props.dispatchFetchImportListItems();
  };

  //
  // Render

  render() {
    const {
      dispatchFetchImportListItems,
      ...otherProps
    } = this.props;

    return (
      <ImportListItems
        onRefreshPress={this.onRefreshPress}
        {...otherProps}
      />
    );
  }
}

ImportListItemsConnector.propTypes = {
  isSyncing: PropTypes.bool.isRequired,
  dispatchFetchImportListItems: PropTypes.func.isRequired
};

export default connect(createMapStateToProps, createMapDispatchToProps)(ImportListItemsConnector);
