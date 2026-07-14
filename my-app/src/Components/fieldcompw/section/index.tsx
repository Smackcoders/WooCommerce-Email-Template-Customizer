import React from 'react';
import { IconButton } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedBlockId, updateWidgetContentData, openEditor } from '../../../Store/Slice/workspaceSlice';
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

// DEBUG LOGGER





interface SectionFieldComponentProps {
  blockId: string;
  columnIndex: number;
  isSelected: boolean;
  onClick: () => void;
  onWidgetClick: (e: React.MouseEvent) => void;
  widgetIndex: number;
  widgetData?: any;
  path?: Array<{ colIdx: number; childIdx: number }>;
}

const SectionFieldComponent: React.FC<SectionFieldComponentProps> = ({
  blockId,
  columnIndex,
  isSelected,
  onClick,
  onWidgetClick,
  widgetIndex,
  widgetData,
  path = []
}) => {
  // ESCALATION LOG: Verify Entry


  const dispatch = useDispatch();
  const selectedNestedPath = useSelector((state: RootState) => state.workspace.selectedNestedPath);

  const storeWidgetContent = useSelector((state: RootState) => {
    const block = state.workspace.blocks.find((b) => b.id === blockId);
    return block?.columns[columnIndex]?.widgetContents[widgetIndex] || null;
  });

  const widgetContent = widgetData || storeWidgetContent;



  const sectionOptions = widgetContent?.contentData
    ? JSON.parse(widgetContent.contentData)
    : {
      backgroundColor: '#f5f5f5',
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      border: { width: 1, style: 'solid', color: '#dddddd', radius: 0 },
      children: []
    };

  const dropRef = React.useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['content', 'layout'],
    drop: (item: { widgetType: string, initialContent?: string, customData?: any, columns?: number }, monitor) => {
      if (monitor.didDrop()) return;
      let newWidgetContentData = "{}";

      if (item.customData) {
        newWidgetContentData = JSON.stringify(regenerateIds(item.customData));
      } else if (item.widgetType === "text") newWidgetContentData = JSON.stringify(defaultTextEditorOptions);
      else if (item.widgetType === "button") newWidgetContentData = JSON.stringify(defaultButtonEditorOptions);
      else if (item.widgetType === "icon") newWidgetContentData = JSON.stringify(defaultIconEditorOptions);
      else if (item.widgetType === "heading") newWidgetContentData = JSON.stringify(defaultHeadingEditorOptions);
      else if (item.widgetType === "divider") newWidgetContentData = JSON.stringify(defaultDividerEditorOptions);
      else if (item.widgetType === "image") newWidgetContentData = item.initialContent || "";
      else if (item.widgetType === "spacer") newWidgetContentData = JSON.stringify({});
      else if (item.widgetType === "container") {
        newWidgetContentData = JSON.stringify({
          maxWidth: '800px',
          width: '100%',
          height: 'auto',
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
          margin: { top: 0, right: 0, bottom: 0, left: 0 },
          border: { width: 1, style: 'solid', color: '#dddddd', radius: 0 },
          children: []
        });
      }

      const newChild = {
        id: `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        contentType: item.widgetType,
        contentData: newWidgetContentData
      };

      const updatedChildren = [...(sectionOptions.children || []), newChild];
      const updatedSectionOptions = { ...sectionOptions, children: updatedChildren };

      dispatch(updateWidgetContentData({
        blockId,
        columnIndex,
        widgetIndex,
        data: JSON.stringify(updatedSectionOptions)
      }));
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }), [sectionOptions, blockId, columnIndex, widgetIndex, dispatch]);

  drop(dropRef);

  const handleDeleteChild = (e: React.MouseEvent, childIndex: number) => {
    e.stopPropagation();
    const updatedChildren = sectionOptions.children.filter((_: any, idx: number) => idx !== childIndex);
    const updatedSectionOptions = { ...sectionOptions, children: updatedChildren };

    dispatch(updateWidgetContentData({
      blockId,
      columnIndex,
      widgetIndex,
      data: JSON.stringify(updatedSectionOptions)
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
    <section
      ref={dropRef}
      onClick={(e) => {
        e.stopPropagation();
        onWidgetClick(e);
        onClick();
        dispatch(setSelectedBlockId(blockId));
      }}
      style={{
        width: sectionOptions.width || '100%',
        backgroundColor: sectionOptions.backgroundColor || '#f5f5f5',
        backgroundImage: sectionOptions.backgroundImage ? `url(${sectionOptions.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        height: sectionOptions.height && sectionOptions.height !== 'auto' ? sectionOptions.height : undefined,
        minHeight: '100px',
        padding: getSpacingStyle(sectionOptions.padding, '0px'),
        margin: getSpacingStyle(sectionOptions.margin, '0px'),
        border: isSelected ? '2px dashed blue' : `${sectionOptions.border?.width || 1}px ${sectionOptions.border?.style || 'solid'} ${sectionOptions.border?.color || '#dddddd'}`,
        borderRadius: `${sectionOptions.border?.radius || 0}px`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: (!sectionOptions.children || sectionOptions.children.length === 0) ? 'center' : 'flex-start',
        alignItems: 'stretch',
        outline: isOver ? '2px dashed green' : 'none',
        boxSizing: 'border-box'
      }}
    >
      {(!sectionOptions.children || sectionOptions.children.length === 0) ? (
        <div style={{
          position: 'relative',
          color: '#999',
          fontSize: '14px',
          width: '100%',
          textAlign: 'center',
          padding: '20px',
          border: '1px dashed #ccc',
          boxSizing: 'border-box'
        }}>
          Drag Content Here
          {isOver && (
            <div style={{ position: 'absolute', top: '50%', left: '8px', right: '8px', height: '4px', backgroundColor: '#000000', borderRadius: '2px', zIndex: 10, transform: 'translateY(-50%)' }} />
          )}
        </div>
      ) : (
        sectionOptions.children.map((child: any, idx: number) => {
          const WidgetComponent = getWidgetComponent(child.contentType);
          if (!WidgetComponent) return null;

          const isChildSelected = isCurrentSelection(idx);
          const childPath = [...path, { colIdx: -1, childIdx: idx }];

          return (
            <div
              key={child.id || idx}
              style={{ position: 'relative', width: '100%' }}
              className="section-child-wrapper"
              onClick={(e) => {
                e.stopPropagation();
                dispatch(openEditor({
                  blockId,
                  columnIndex,
                  widgetIndex,
                  contentType: child.contentType,
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
                    widgetIndex,
                    contentType: child.contentType,
                    nestedPath: childPath
                  }));
                }}
                onWidgetClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  dispatch(openEditor({
                    blockId,
                    columnIndex,
                    widgetIndex,
                    contentType: child.contentType,
                    nestedPath: childPath
                  }));
                }}
              />
              <div
                className="delete-btn-section"
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
                <IconButton size="small" onClick={(e) => handleDeleteChild(e, idx)}>
                  <DeleteIcon fontSize="small" color="error" />
                </IconButton>
              </div>
            </div>
          );
        })
      )}
    </section>
  );
};

export default SectionFieldComponent;
