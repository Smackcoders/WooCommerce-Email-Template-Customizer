import React from 'react';
import { IconButton } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedBlockId, updateWidgetContentData, openEditor } from '../../../Store/Slice/workspaceSlice';
import { RootState } from '../../../Store/store';
import { useDrop, useDrag } from 'react-dnd';
import { getWidgetComponent, regenerateIds } from '../../utils/getWidgetComponent';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  defaultTextEditorOptions,
  defaultButtonEditorOptions,
  defaultHeadingEditorOptions,
  defaultDividerEditorOptions,
  defaultIconEditorOptions,
} from '../../../Store/Slice/workspaceSlice';

interface ContainerFieldComponentProps {
  blockId: string;
  columnIndex: number;
  isSelected: boolean;
  onClick: () => void;
  onWidgetClick: (e: React.MouseEvent) => void;
  widgetIndex: number;
  widgetData?: any;
  path?: Array<{ colIdx: number; childIdx: number }>;
}

interface NestedDraggableChildProps {
  child: any;
  idx: number;
  blockId: string;
  columnIndex: number;
  widgetIndex: number;
  path: Array<{ colIdx: number; childIdx: number }>;
  containerOptions: any;
  isChildSelected: boolean;
  onWidgetClick: (e: React.MouseEvent) => void;
  onClick: (e?: React.MouseEvent) => void;
  handleDeleteChild: (e: React.MouseEvent, idx: number) => void;
  dispatch: any;
  WidgetComponent: React.ComponentType<any>;
}

const NestedDraggableChild: React.FC<NestedDraggableChildProps> = ({
  child,
  idx,
  blockId,
  columnIndex,
  widgetIndex,
  path,
  containerOptions,
  isChildSelected,
  onWidgetClick,
  onClick,
  handleDeleteChild,
  dispatch,
  WidgetComponent
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const childDisplay = React.useMemo(() => {
      try {
          const data = JSON.parse(child.contentData || "{}");
          return data.display;
      } catch {
          return undefined;
      }
  }, [child]);
  const resolvedDisplay = childDisplay || 'block';


  const [{ isDragging }, drag] = useDrag({
    type: 'NESTED_WIDGET',
    item: {
      type: 'NESTED_WIDGET',
      index: idx,
      blockId,
      columnIndex,
      widgetIndex,
      path
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ['NESTED_WIDGET'],
    hover: (item: any, monitor) => {
      if (!ref.current) return;
      if (item.index === idx) return;

      const dragIndex = item.index;
      const hoverIndex = idx;

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as any).y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      const updatedChildren = [...(containerOptions.children || [])];
      const [removed] = updatedChildren.splice(dragIndex, 1);
      updatedChildren.splice(hoverIndex, 0, removed);

      const updatedOptions = {
        ...containerOptions,
        children: updatedChildren
      };

      dispatch(updateWidgetContentData({
        blockId,
        columnIndex,
        widgetIndex,
        data: JSON.stringify(updatedOptions),
        nestedPath: path.slice(0, -1)
      }));

      item.index = hoverIndex;
    }
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      id={`outline_${blockId}_${columnIndex}_${widgetIndex}_${path.map((p: any) => p.childIdx).join('_')}`}
      style={{
        position: 'relative',
        width: (resolvedDisplay === 'inline-block' || resolvedDisplay === 'inline') ? 'auto' : '100%',
        display: (resolvedDisplay === 'inline-block' || resolvedDisplay === 'inline') ? 'inline-block' : 'block',
        verticalAlign: 'top',
        opacity: isDragging ? 0.45 : 1,
        minHeight: 0,
        overflow: 'hidden',
      }}
      className="container-child-wrapper"
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
    >
      <WidgetComponent
        blockId={blockId}
        columnIndex={columnIndex}
        widgetIndex={widgetIndex}
        widgetData={child}
        isSelected={isChildSelected}
        path={path}
        onClick={onClick}
        onWidgetClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          onClick();
        }}
      />
      <div
        className="delete-btn-container"
        style={{
          display: isChildSelected ? 'flex' : 'none',
          position: 'absolute',
          right: -12,
          top: -12,
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
};

const ContainerFieldComponent: React.FC<ContainerFieldComponentProps> = ({
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



  const containerOptions = widgetContent?.contentData
    ? JSON.parse(widgetContent.contentData)
    : {
      maxWidth: '800px',
      backgroundColor: '#ffffff',
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      children: []
    };


  const dropRef = React.useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['content', 'layout', 'NESTED_WIDGET'],
    drop: (item: any, monitor) => {
      if (monitor.didDrop()) return;
      handleDrop(item);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }), [containerOptions, blockId, columnIndex, widgetIndex, dispatch]);

  drop(dropRef);

  const handleDrop = (item: any) => {
    let newWidgetContentData = "{}";
    if (item.type === 'NESTED_WIDGET') {
      // Reordering is handled in hover, so we only handle external drops here.
      return;
    }
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
        children: []
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

    const updatedOptions = {
      ...containerOptions,
      children: [...(containerOptions.children || []), newChild]
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
    const updatedChildren = (containerOptions.children || []).filter((_: any, idx: number) => idx !== childIndex);
    const updatedOptions = { ...containerOptions, children: updatedChildren };

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

  const normalizedPadding = typeof containerOptions.padding === 'object' ? containerOptions.padding : {
    top: containerOptions.padding || 20,
    right: containerOptions.padding || 20,
    bottom: containerOptions.padding || 20,
    left: containerOptions.padding || 20
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
        backgroundColor: containerOptions.backgroundColor || '#ffffff',

        paddingTop: `${normalizedPadding.top}px`,
        paddingRight: `${normalizedPadding.right}px`,
        paddingBottom: `${normalizedPadding.bottom}px`,
        paddingLeft: `${normalizedPadding.left}px`,
        borderTop: `${containerOptions.borderTopWidth ?? containerOptions.border?.width ?? 0}px ${containerOptions.borderTopStyle || containerOptions.border?.style || 'none'} ${containerOptions.borderTopColor || containerOptions.border?.color || 'transparent'}`,
        borderRight: `${containerOptions.borderRightWidth ?? containerOptions.border?.width ?? 0}px ${containerOptions.borderRightStyle || containerOptions.border?.style || 'none'} ${containerOptions.borderRightColor || containerOptions.border?.color || 'transparent'}`,
        borderBottom: `${containerOptions.borderBottomWidth ?? containerOptions.border?.width ?? 0}px ${containerOptions.borderBottomStyle || containerOptions.border?.style || 'none'} ${containerOptions.borderBottomColor || containerOptions.border?.color || 'transparent'}`,
        borderLeft: `${containerOptions.borderLeftWidth ?? containerOptions.border?.width ?? 0}px ${containerOptions.borderLeftStyle || containerOptions.border?.style || 'none'} ${containerOptions.borderLeftColor || containerOptions.border?.color || 'transparent'}`,
        outline: isSelected ? '2px dashed blue' : (isOver ? '2px dashed green' : ((!containerOptions.borderTopStyle || containerOptions.borderTopStyle === 'none') && (!containerOptions.border?.style || containerOptions.border?.style === 'none') ? '1px dashed #ddd' : 'none')),
        outlineOffset: '-2px',
        borderRadius: `${containerOptions.borderRadius !== undefined ? containerOptions.borderRadius : (containerOptions.border?.radius !== undefined ? containerOptions.border.radius : 4)}px`,
        position: 'relative',
        minHeight: '100px',
        display: 'block',
      }}
    >
      {(!containerOptions.children || containerOptions.children.length === 0) ? (
        <div style={{ position: 'relative', color: '#999', fontSize: '14px', textAlign: 'center', padding: '16px 0' }}>
          Container Content Area
          {isOver && (
             <div style={{ position: 'absolute', top: '50%', left: '8px', right: '8px', height: '4px', backgroundColor: '#000000', borderRadius: '2px', zIndex: 10, transform: 'translateY(-50%)' }} />
          )}
        </div>
      ) : (
        containerOptions.children.map((child: any, idx: number) => {
          const WidgetComponent = getWidgetComponent(child.contentType);
          if (!WidgetComponent) return null;

          const isChildSelected = isCurrentSelection(idx);
          const childPath = [...path, { colIdx: -1, childIdx: idx }];

          return (
            <NestedDraggableChild
              key={child.id || idx}
              child={child}
              idx={idx}
              blockId={blockId}
              columnIndex={columnIndex}
              widgetIndex={widgetIndex}
              path={childPath}
              containerOptions={containerOptions}
              isChildSelected={isChildSelected}
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
              onClick={(e?: React.MouseEvent) => {
                dispatch(openEditor({
                  blockId,
                  columnIndex,
                  contentType: child.contentType,
                  widgetIndex: widgetIndex,
                  nestedPath: childPath
                }));
              }}
              handleDeleteChild={handleDeleteChild}
              dispatch={dispatch}
              WidgetComponent={WidgetComponent}
            />
          );
        })
      )}
    </div>
  );
};

export default ContainerFieldComponent;
