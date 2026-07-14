
import React from 'react';
import { IconButton } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { updateWidgetContentData, openEditor } from '../../../Store/Slice/workspaceSlice';

import { RootState } from '../../../Store/store';
import { useDrop } from 'react-dnd';
import { getWidgetComponent, regenerateIds } from '../../utils/getWidgetComponent';
import DeleteIcon from '@mui/icons-material/Delete';
import { getSpacingStyle } from '../../utils/treeHelper';
import {
  defaultTextEditorOptions,
  defaultButtonEditorOptions,
  defaultHeadingEditorOptions,
  defaultDividerEditorOptions,
  defaultIconEditorOptions,
} from '../../../Store/Slice/workspaceSlice';

interface RowFieldComponentProps {
  blockId: string;
  columnIndex: number;
  isSelected: boolean;
  onClick: () => void;
  onWidgetClick: (e: React.MouseEvent) => void;
  widgetIndex: number;
  widgetData?: any;
  path?: Array<{ colIdx: number; childIdx: number }>;
}

const RowFieldComponent: React.FC<RowFieldComponentProps> = ({
  blockId,
  columnIndex,
  isSelected,
  onClick,
  onWidgetClick,
  widgetIndex,
  widgetData,
  path = []
}) => {
  const dispatch = useDispatch();
  const selectedNestedPath = useSelector((state: RootState) => state.workspace.selectedNestedPath);

  const storeWidgetContent = useSelector((state: RootState) => {
    const block = state.workspace.blocks.find((b) => b.id === blockId);
    return block?.columns[columnIndex]?.widgetContents[widgetIndex] || null;
  });

  const widgetContent = widgetData || storeWidgetContent;

  const rowOptions = widgetContent?.contentData
    ? JSON.parse(widgetContent.contentData)
    : {
      backgroundColor: 'transparent',
      columns: 2,
      gap: 20
    };

  const numColumns = rowOptions.columns || 2;

  // Initialize columnsData if missing or length mismatch
  if (!rowOptions.columnsData || rowOptions.columnsData.length !== numColumns) {
    rowOptions.columnsData = Array(numColumns).fill(0).map((_, i) => (rowOptions.columnsData && rowOptions.columnsData[i]) || { id: `col_${i}_${Date.now()}`, children: [] });
  }

  // This change is in RowFieldComponent, but I need to fix workspaceSlice first.
  // I will perform the workspaceSlice fix in the next tool call then.
  // Wait, I can do it here if I verify the logic. 
  // Yes, JSON.parse(action.payload.data) makes sense because previously we were just assigning the string. 
  // Now we want to MERGE expected properties into the nested one.
  // Since RowFieldComponent sends the full object stringified, merging it spread over the old one is effectively a replace/update.

  const handleDrop = (item: any, colIndex: number) => {
    let newWidgetContentData = "{}";
    if (item.customData) {
      newWidgetContentData = JSON.stringify(regenerateIds(item.customData));
    } else if (item.widgetType === "image") {
      newWidgetContentData = item.initialContent || "";
    } else if (item.widgetType === "text") {
      newWidgetContentData = JSON.stringify(defaultTextEditorOptions);
    } else if (item.widgetType === "heading") {
      newWidgetContentData = JSON.stringify(defaultHeadingEditorOptions);
    } else if (item.widgetType === "divider") {
      newWidgetContentData = JSON.stringify(defaultDividerEditorOptions);
    } else if (item.widgetType === "button") {
      newWidgetContentData = JSON.stringify(defaultButtonEditorOptions);
    } else if (item.widgetType === "icon") {
      newWidgetContentData = JSON.stringify(defaultIconEditorOptions);
    } else if (item.widgetType === "container") {
      newWidgetContentData = JSON.stringify({
        maxWidth: '800px',
        backgroundColor: '#ffffff',
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        border: { width: 1, style: 'solid', color: '#dddddd', radius: 4 },
        children: [],
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        flexWrap: 'nowrap',
        gap: 10,
        borderRadius: 4
      });
    } else if (item.widgetType === "billingAddress" || item.widgetType === "shippingAddress") {
      const isBilling = item.widgetType === 'billingAddress';
      const title = isBilling ? 'BILL TO:' : 'SHIP TO:';
      const prefix = isBilling ? 'billing' : 'shipping';
      
      const headings = [
        { text: title, tag: 'h4', bold: true, mb: 10 },
        { text: `{{${prefix}_first_name}} {{${prefix}_last_name}}`, tag: 'span', mb: 5 },
        { text: `{{${prefix}_company}}`, tag: 'span', mb: 5 },
        { text: `{{${prefix}_address_1}}`, tag: 'span', mb: 5 },
        { text: `{{${prefix}_address_2}}`, tag: 'span', mb: 5 },
        { text: `{{${prefix}_city}}, {{${prefix}_state}} {{${prefix}_postcode}}`, tag: 'span', mb: 5 },
        { text: `{{${prefix}_country}}`, tag: 'span', mb: 5 },
        { text: `{{${prefix}_phone}}`, tag: 'span', mb: 5 },
        ...(isBilling ? [{ text: `{{billing_email}}`, tag: 'span', mb: 5 }] : []),
      ];

      const children = headings.map((h, idx) => ({
        id: `child_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`,
        contentType: 'heading',
        contentData: JSON.stringify({
          ...defaultHeadingEditorOptions,
          content: h.text,
          headingType: h.tag,
          fontWeight: h.bold ? 'bold' : 'normal',
          margin: { top: 0, right: 0, bottom: h.mb, left: 0 },
          display: 'block',
          fontSize: h.tag === 'h4' ? 16 : 14
        })
      }));

      // Override the item type to container so it's inserted as a nested container
      item.widgetType = 'container';
      newWidgetContentData = JSON.stringify({
        maxWidth: '100%',
        backgroundColor: 'transparent',
        padding: { top: 10, right: 10, bottom: 10, left: 10 },
        border: { width: 0, style: 'none', color: 'transparent', radius: 0 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        children: children
      });
    } else if (item.widgetType === "row") {
      const cols = item.columns || 2;
      newWidgetContentData = JSON.stringify({
        backgroundColor: 'transparent',
        columns: cols,
        gap: 20,
        columnsData: Array(cols).fill(0).map((_, i) => ({ id: `col_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, children: [] }))
      });
    } else if (item.widgetType === "section") {
      newWidgetContentData = JSON.stringify({
        backgroundColor: '#f5f5f5',
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        border: { width: 1, style: 'solid', color: '#dddddd', radius: 0 },
        children: []
      });
    }

    const newChild = {
      id: `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contentType: item.widgetType,
      contentData: newWidgetContentData
    };

    const updatedColumnsData = [...rowOptions.columnsData];
    updatedColumnsData[colIndex] = {
      ...updatedColumnsData[colIndex],
      children: [...(updatedColumnsData[colIndex].children || []), newChild]
    };

    const updatedRowOptions = { ...rowOptions, columnsData: updatedColumnsData };

    dispatch(updateWidgetContentData({
      blockId,
      columnIndex,
      widgetIndex,
      data: JSON.stringify(updatedRowOptions),
      nestedPath: path
    }));
  };

  const handleDeleteChild = (e: React.MouseEvent, colIndex: number, childIndex: number) => {
    e.stopPropagation();
    const updatedColumnsData = [...rowOptions.columnsData];
    const colChildren = updatedColumnsData[colIndex].children.filter((_: any, idx: number) => idx !== childIndex);
    updatedColumnsData[colIndex] = { ...updatedColumnsData[colIndex], children: colChildren };

    const updatedRowOptions = { ...rowOptions, columnsData: updatedColumnsData };

    dispatch(updateWidgetContentData({
      blockId,
      columnIndex,
      widgetIndex,
      data: JSON.stringify(updatedRowOptions),
      nestedPath: path
    }));
  };

  return (
    <div
      onClick={(e) => {
        // Handle select row
      }}
      style={{
        width: '100%',
        backgroundColor: rowOptions.backgroundColor || 'transparent',
        border: isSelected ? '2px dashed blue' : '1px solid #ddd',
        borderRadius: '4px',
        padding: getSpacingStyle(rowOptions.padding, '0px'),
        margin: getSpacingStyle(rowOptions.margin, '0px'),
        display: 'flex',
        gap: `${rowOptions.gap != null ? rowOptions.gap : 16}px`,
        position: 'relative',
        minHeight: '100px',
        boxSizing: 'border-box'
      }}
    >
      {rowOptions.columnsData.map((colData: any, colIdx: number) => (
        <ColumnDropTarget
          key={colData.id || colIdx}
          colData={colData}
          colIdx={colIdx}
          onDrop={(item: any) => handleDrop(item, colIdx)}
          onDeleteChild={(e: React.MouseEvent, childIdx: number) => handleDeleteChild(e, colIdx, childIdx)}
          blockId={blockId}
          columnIndex={columnIndex}
          widgetIndex={widgetIndex}
          selectedNestedPath={selectedNestedPath}
          path={path}
        />
      ))}
    </div>
  );
};

// Sub-component for individual column drop target
const ColumnDropTarget = ({ colData, colIdx, onDrop, onDeleteChild, blockId, columnIndex, widgetIndex, selectedNestedPath, path }: any) => {
  const dispatch = useDispatch();
  const dropRef = React.useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['content', 'layout'],
    drop: (item: any, monitor) => {
      if (monitor.didDrop()) return;
      onDrop(item);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }), [onDrop]);

  drop(dropRef);

  const isCurrentSelection = (childIdx: number) => {
    if (!selectedNestedPath || selectedNestedPath.length !== path.length + 1) return false;
    for (let i = 0; i < path.length; i++) {
      if (selectedNestedPath[i].colIdx !== path[i].colIdx || selectedNestedPath[i].childIdx !== path[i].childIdx) return false;
    }
    const lastPart = selectedNestedPath[selectedNestedPath.length - 1];
    return lastPart.colIdx === colIdx && lastPart.childIdx === childIdx;
  };

  return (
    <div
      ref={dropRef}
      style={{
        flex: 1,
        backgroundColor: isOver ? 'rgba(0,128,0,0.05)' : 'transparent',
        border: isOver ? '2px dashed green' : (colData.children && colData.children.length > 0 ? 'none' : '1px dashed #ccc'),
        borderRadius: '2px',
        minHeight: '50px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: colData.children && colData.children.length > 0 ? 'flex-start' : 'center',
        alignItems: 'stretch',
        padding: '8px',
        boxSizing: 'border-box'
      }}
    >
      {(!colData.children || colData.children.length === 0) ? (
        <div style={{
          fontSize: '12px',
          color: '#999',
          width: '100%',
          textAlign: 'center',
          padding: '10px',
          border: '1px dashed #ccc',
          boxSizing: 'border-box'
        }}>
          Column {colIdx + 1}
        </div>
      ) : (
        colData.children.map((child: any, idx: number) => {
          const WidgetComponent = getWidgetComponent(child.contentType);
          if (!WidgetComponent) return null;

          const isChildSelected = isCurrentSelection(idx);
          const childPath = [...path, { colIdx, childIdx: idx }];

          return (
            <div
              key={child.id || idx}
              id={`outline_${blockId}_${columnIndex}_${widgetIndex}_${childPath.map((p: any) => p.childIdx).join('_')}`}
              style={{ position: 'relative', width: '100%' }}
              className="row-child-wrapper"
              onClick={(e) => {
                e.stopPropagation();
                dispatch(openEditor({
                  blockId,
                  columnIndex,
                  contentType: child.contentType,
                  widgetIndex: widgetIndex,
                  nestedPath: childPath
                }));
              }}
            >
              <WidgetComponent
                blockId={blockId}
                columnIndex={columnIndex}
                widgetIndex={widgetIndex}
                widgetData={child}
                isSelected={isChildSelected}
                path={childPath}
                onClick={(e?: React.MouseEvent) => {
                  dispatch(openEditor({
                    blockId,
                    columnIndex,
                    contentType: child.contentType,
                    widgetIndex: widgetIndex,
                    nestedPath: childPath
                  }));
                }}
                onWidgetClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  dispatch(openEditor({
                    blockId,
                    columnIndex,
                    contentType: child.contentType,
                    widgetIndex: widgetIndex,
                    nestedPath: childPath
                  }));
                }}
              />
              <div
                className="delete-btn"
                style={{
                  display: 'none',
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                  zIndex: 10,
                  cursor: 'pointer'
                }}
              >
                <IconButton size="small" onClick={(e) => onDeleteChild(e, idx)}>
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default RowFieldComponent;
