import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Alert from 'Components/Alert';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import FilterMenu from 'Components/Menu/FilterMenu';
import PageContent from 'Components/Page/PageContent';
import PageContentBody from 'Components/Page/PageContentBody';
import PageToolbar from 'Components/Page/Toolbar/PageToolbar';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import PageToolbarSection from 'Components/Page/Toolbar/PageToolbarSection';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import TableOptionsModalWrapper from 'Components/Table/TableOptions/TableOptionsModalWrapper';
import { align, icons, kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import ImportListItemsRow from './ImportListItemsRow';

class ImportListItems extends Component {

  //
  // Render

  render() {
    const {
      isFetching,
      isPopulated,
      error,
      items,
      columns,
      isSyncing,
      selectedFilterKey,
      filters,
      customFilters,
      totalItems,
      onRefreshPress,
      onSyncPress,
      onFilterSelect,
      onTableOptionChange,
      ...otherProps
    } = this.props;

    const hasItems = !!items.length;

    return (
      <PageContent title={translate('ImportListItems')}>
        <PageToolbar>
          <PageToolbarSection>
            <PageToolbarButton
              label={translate('Refresh')}
              iconName={icons.REFRESH}
              isSpinning={isFetching}
              onPress={onRefreshPress}
            />

            <PageToolbarButton
              label={translate('ImportListItemsSyncLists')}
              iconName={icons.REFRESH}
              isSpinning={isSyncing}
              onPress={onSyncPress}
            />
          </PageToolbarSection>

          <PageToolbarSection alignContent={align.RIGHT}>
            <TableOptionsModalWrapper
              {...otherProps}
              columns={columns}
              onTableOptionChange={onTableOptionChange}
            >
              <PageToolbarButton
                label={translate('Options')}
                iconName={icons.TABLE}
              />
            </TableOptionsModalWrapper>

            <FilterMenu
              alignMenu={align.RIGHT}
              selectedFilterKey={selectedFilterKey}
              filters={filters}
              customFilters={customFilters}
              onFilterSelect={onFilterSelect}
            />
          </PageToolbarSection>
        </PageToolbar>

        <PageContentBody>
          {
            isFetching && !isPopulated &&
              <LoadingIndicator />
          }

          {
            !isFetching && !!error &&
              <Alert kind={kinds.DANGER}>
                {translate('ImportListItemsLoadError')}
              </Alert>
          }

          {
            isPopulated && !error && !hasItems &&
              <Alert kind={kinds.INFO}>
                {
                  totalItems ?
                    translate('ImportListItemsAllFiltered') :
                    translate('ImportListItemsNoItems')
                }
              </Alert>
          }

          {
            isPopulated && !error && hasItems &&
              <Table
                columns={columns}
                {...otherProps}
                onTableOptionChange={onTableOptionChange}
              >
                <TableBody>
                  {
                    items.map((item) => {
                      return (
                        <ImportListItemsRow
                          key={item.id}
                          columns={columns}
                          {...item}
                        />
                      );
                    })
                  }
                </TableBody>
              </Table>
          }
        </PageContentBody>
      </PageContent>
    );
  }
}

ImportListItems.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  isPopulated: PropTypes.bool.isRequired,
  error: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  isSyncing: PropTypes.bool.isRequired,
  selectedFilterKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  filters: PropTypes.arrayOf(PropTypes.object).isRequired,
  customFilters: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalItems: PropTypes.number.isRequired,
  onRefreshPress: PropTypes.func.isRequired,
  onSyncPress: PropTypes.func.isRequired,
  onFilterSelect: PropTypes.func.isRequired,
  onTableOptionChange: PropTypes.func.isRequired
};

export default ImportListItems;
