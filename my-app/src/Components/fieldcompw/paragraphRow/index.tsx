import React from 'react';
import { IconButton } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedBlockId, updateWidgetContentData, openEditor } from '../../../Store/Slice/workspaceSlice';
import { RootState } from '../../../Store/store';
import { useDrop } from 'react-dnd';
import { getWidgetComponent, regenerateIds } from '../../utils/getWidgetComponent';
import DeleteIcon from '@mui/icons-material/Delete';
import { getSpacingStyle } from '../../utils/treeHelper';
import { defaultTextEditorOptions } from '../../../Store/Slice/workspaceSlice';

interface ParagraphRowFieldComponentProps {
  blockId: string;
  columnIndex: number;
  isSelected: boolean;
  onClick: () => void;
  onWidgetClick: (e: React.MouseEvent) => void;
  widgetIndex: number;
  widgetData?: any;
  path?: Array<{ colIdx: number; childIdx: number }>;
}

const ParagraphRowFieldComponent: React.FC<ParagraphRowFieldComponentProps> = ({
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
      rowLayout: 'horizontal',
      gap: 10,
      justifyContent: 'flex-start',
      labelWidth: 120,
      hideIfEmpty: true,
      backgroundColor: 'transparent',
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      margin: { top: 0, right: 0, bottom: 8, left: 0 },
      children: []
    };

  const dropRef = React.useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['content'],
    drop: (item: any, monitor) => {
      if (monitor.didDrop()) return;
      handleDrop(item);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }), [rowOptions, blockId, columnIndex, widgetIndex, dispatch]);

  drop(dropRef);

  const handleDrop = (item: any) => {
    let newWidgetContentData = "{}";
    if (item.customData) {
      newWidgetContentData = JSON.stringify(regenerateIds(item.customData));
    } else if (item.widgetType === "text") {
      newWidgetContentData = JSON.stringify(defaultTextEditorOptions);
    } else if (item.widgetType === "link") {
      newWidgetContentData = JSON.stringify({
        text: 'Click here',
        url: '#',
        textAlign: 'left',
        color: '#007bff',
        underline: false,
        fontFamily: 'global',
        fontSize: 14,
        fontWeight: 'normal',
      });
    } else {
      return; // Paragraph Row only accepts text and link content
    }

    const newChild = {
      id: `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contentType: item.widgetType,
      contentData: newWidgetContentData
    };

    const updatedOptions = {
      ...rowOptions,
      children: [...(rowOptions.children || []), newChild]
    };

    dispatch(updateWidgetContentData({
      blockId,
      columnIndex,
      widgetIndex,
      data: JSON.stringify(updatedOptions),
      nestedPath: path
    }));
  };

  const handleDeleteChild = (e: React.MouseEvent, childIndex: number) => {
    e.stopPropagation();
    const updatedChildren = (rowOptions.children || []).filter((_: any, idx: number) => idx !== childIndex);
    const updatedOptions = { ...rowOptions, children: updatedChildren };

    dispatch(updateWidgetContentData({
      blockId,
      columnIndex,
      widgetIndex,
      data: JSON.stringify(updatedOptions),
      nestedPath: path
    }));
  };

  const isCurrentSelection = (childIdx: number) => {
    if (!selectedNestedPath || selectedNestedPath.length !== path.length + 1) return false;
    for (let i = 0; i < path.length; i++) {
      if (selectedNestedPath[i].colIdx !== path[i].colIdx || selectedNestedPath[i].childIdx !== path[i].childIdx) return false;
    }
    const lastPart = selectedNestedPath[selectedNestedPath.length - 1];
    return lastPart.colIdx === -1 && lastPart.childIdx === childIdx;
  };

  return (
    <div
      ref={dropRef}
      onClick={(e) => {
        e.stopPropagation();
        onWidgetClick(e);
        onClick();
        dispatch(setSelectedBlockId(blockId));
      }}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: rowOptions.backgroundColor || 'transparent',
        padding: getSpacingStyle(rowOptions.padding, '0px'),
        margin: getSpacingStyle(rowOptions.margin, '0px'),
        border: isSelected ? '2px dashed blue' : (isOver ? '2px dashed green' : '1px dashed transparent'),
        position: 'relative',
        display: 'flex',
        flexDirection: rowOptions.rowLayout === 'vertical' ? 'column' : 'row',
        justifyContent: rowOptions.justifyContent || 'flex-start',
        alignItems: rowOptions.rowLayout === 'vertical' ? 'flex-start' : 'center',
        gap: `${rowOptions.gap || 0}px`,
      }}
    >
      {(!rowOptions.children || rowOptions.children.length === 0) ? (
        <div style={{ color: '#999', fontSize: '12px', textAlign: 'center', padding: '10px 0', width: '100%' }}>
          Paragraph Row
        </div>
      ) : (
        rowOptions.children.map((child: any, idx: number) => {
          const WidgetComponent = getWidgetComponent(child.contentType);
          if (!WidgetComponent) return null;

          const isChildSelected = isCurrentSelection(idx);
          const childPath = [...path, { colIdx: -1, childIdx: idx }];
          
          // Apply fixed width to the FIRST child if horizontal
          const isLabel = idx === 0 && rowOptions.rowLayout === 'horizontal';

          return (
            <div
              key={child.id || idx}
              style={{
                position: 'relative',
                flex: isLabel ? `0 0 ${rowOptions.labelWidth || 120}px` : '1',
                width: isLabel ? `${rowOptions.labelWidth || 120}px` : 'auto',
                minWidth: 0, // allow flex shrinking if necessary
              }}
              className="paragraph-row-child-wrapper"
            >
              <div style={{ pointerEvents: 'none' }}>
                <WidgetComponent
                  blockId={blockId}
                  columnIndex={columnIndex}
                  widgetIndex={widgetIndex}
                  widgetData={child}
                  isSelected={isChildSelected}
                  path={childPath}
                  onClick={() => {}}
                  onWidgetClick={() => {}}
                />
              </div>
              {/* Overlay for selection */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  cursor: 'pointer',
                  border: isChildSelected ? '1px dashed orange' : 'none',
                  zIndex: 2
                }}
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
              />
              <div
                className="delete-btn-paragraph-row"
                style={{
                  display: isChildSelected ? 'block' : 'none',
                  position: 'absolute',
                  right: 0,
                  top: -15,
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                  zIndex: 10,
                  cursor: 'pointer'
                }}
              >
                <IconButton size="small" onClick={(e) => handleDeleteChild(e, idx)}>
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

export default ParagraphRowFieldComponent;
