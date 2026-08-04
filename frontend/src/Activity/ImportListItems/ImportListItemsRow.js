import PropTypes from 'prop-types';
import React from 'react';
import Label from 'Components/Label';
import RelativeDateCellConnector from 'Components/Table/Cells/RelativeDateCellConnector';
import TableRowCell from 'Components/Table/Cells/TableRowCell';
import TableRow from 'Components/Table/TableRow';
import { kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import styles from './ImportListItemsRow.css';

function statusLabel(isExistingAlbum, isMonitored, hasFile) {
  // Only actual track files mean the album is here. Adding an artist creates
  // album rows for their entire discography, so row existence proves nothing.
  if (hasFile) {
    return {
      kind: kinds.SUCCESS,
      text: translate('ImportListItemsInLibrary')
    };
  }

  if (isExistingAlbum && isMonitored) {
    return {
      kind: kinds.WARNING,
      text: translate('ImportListItemsWanted')
    };
  }

  if (isExistingAlbum) {
    return {
      kind: kinds.DISABLED,
      text: translate('ImportListItemsUnmonitored')
    };
  }

  return {
    kind: kinds.DANGER,
    text: translate('ImportListItemsNotAdded')
  };
}

function ImportListItemsRow(props) {
  const {
    importList,
    artist,
    album,
    releaseDate,
    discovered,
    isExistingAlbum,
    isMonitored,
    hasFile,
    columns
  } = props;

  const status = statusLabel(isExistingAlbum, isMonitored, hasFile);

  return (
    <TableRow>
      {
        columns.map((column) => {
          const {
            name,
            isVisible
          } = column;

          if (!isVisible) {
            return null;
          }

          if (name === 'importList') {
            return (
              <TableRowCell key={name}>
                {importList}
              </TableRowCell>
            );
          }

          if (name === 'artist') {
            return (
              <TableRowCell key={name}>
                {artist}
              </TableRowCell>
            );
          }

          if (name === 'album') {
            return (
              <TableRowCell key={name}>
                {album}
              </TableRowCell>
            );
          }

          if (name === 'releaseDate') {
            return (
              <TableRowCell key={name} className={styles.releaseDate}>
                {releaseDate ? releaseDate.substring(0, 10) : '-'}
              </TableRowCell>
            );
          }

          if (name === 'status') {
            return (
              <TableRowCell key={name}>
                <Label kind={status.kind}>
                  {status.text}
                </Label>
              </TableRowCell>
            );
          }

          if (name === 'discovered') {
            return (
              <RelativeDateCellConnector
                key={name}
                date={discovered}
              />
            );
          }

          return null;
        })
      }
    </TableRow>
  );
}

ImportListItemsRow.propTypes = {
  importList: PropTypes.string,
  artist: PropTypes.string,
  album: PropTypes.string,
  releaseDate: PropTypes.string,
  discovered: PropTypes.string,
  isExistingAlbum: PropTypes.bool.isRequired,
  isMonitored: PropTypes.bool.isRequired,
  hasFile: PropTypes.bool.isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default ImportListItemsRow;
