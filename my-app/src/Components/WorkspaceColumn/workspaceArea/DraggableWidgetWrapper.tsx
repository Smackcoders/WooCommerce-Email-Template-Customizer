import React, { useRef, useState } from 'react';
import { useDrag, useDrop, useDragLayer } from 'react-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import ContentCopyTwoToneIcon from '@mui/icons-material/ContentCopyTwoTone';
import DeleteOutlineTwoToneIcon from '@mui/icons-material/DeleteOutlineTwoTone';
import EditIcon from '@mui/icons-material/Edit';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { RootState } from '../../../Store/store';
import {
    reorderColumnContent,
    moveColumnContent,
    copyColumnContent,
    deleteColumnContent,
    copyWidget,
    pasteCopiedWidget
} from '../../../Store/Slice/workspaceSlice';
interface DraggableWidgetWrapperProps {
    blockId: string;
    columnIndex: number;
    widgetIndex: number;
    children: React.ReactNode;
    isSelected: boolean;
    previewMode: boolean;
    onWidgetClick: (e: React.MouseEvent) => void;
    alignItems?: string;
    onInsertWidget?: (item: any, insertIndex: number) => void;
}

interface DragItem {
    index: number;
    type: string;
    blockId: string;
    columnIndex: number;
    sourceBlockId?: string;
    sourceColumnIndex?: number;
}

const DraggableWidgetWrapper: React.FC<DraggableWidgetWrapperProps> = ({
    blockId,
    columnIndex,
    widgetIndex,
    children,
    isSelected,
    previewMode,
    onWidgetClick,
    alignItems,
    onInsertWidget
}) => {
    const dispatch = useDispatch();
    const ref = useRef<HTMLDivElement>(null);
    const [contextMenu, setContextMenu] = useState<{ mouseX: number; mouseY: number } | null>(null);
    const [insertPosition, setInsertPosition] = useState<'before' | 'after' | null>(null);

    const { blocks, copiedWidget } = useSelector((state: RootState) => state.workspace);
    const storeBlock = blocks.find((b) => b.id === blockId);
    const storeColumn = storeBlock?.columns[columnIndex];
    const widget = storeColumn?.widgetContents[widgetIndex];

    const widgetDisplay = React.useMemo(() => {
        if (!widget?.contentData) return undefined;
        try {
            const data = JSON.parse(widget.contentData);
            return data.display;
        } catch {
            return undefined;
        }
    }, [widget]);

    const resolvedDisplay = React.useMemo(() => {
        if (widgetDisplay === 'none') {
            return previewMode ? 'none' : 'flex';
        }
        return widgetDisplay || 'flex';
    }, [widgetDisplay, previewMode]);

    const { isDraggingGlobal } = useDragLayer((monitor) => ({
        isDraggingGlobal: monitor.isDragging(),
    }));

    const [{ isDragging }, drag] = useDrag({
        type: 'WIDGET',
        item: {
            type: 'WIDGET',
            index: widgetIndex,
            blockId,
            columnIndex,
            sourceBlockId: blockId,
            sourceColumnIndex: columnIndex,
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        canDrag: () => !previewMode && widget?.contentType !== 'emailFooter' && !(window as any).__woomailerInnerElementDragActive && !(window as any).__woomailerFooterSectionDragActive,
    });

    const [{ isOver }, drop] = useDrop({
        accept: ['WIDGET', 'content'],
        hover: (item: DragItem & { widgetType?: string }, monitor) => {
            if (!ref.current) return;
            const hoverBoundingRect = ref.current.getBoundingClientRect();
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
            const clientOffset = monitor.getClientOffset();
            const hoverClientY = (clientOffset as any).y - hoverBoundingRect.top;

            if (item.widgetType) {
                if (!monitor.isOver({ shallow: true })) {
                    if (insertPosition !== null) setInsertPosition(null);
                    return;
                }
                setInsertPosition(hoverClientY < hoverMiddleY ? 'before' : 'after');
                return;
            }

            const dragIndex = item.index;
            const hoverIndex = widgetIndex;

            const sourceBlockId = item.sourceBlockId || item.blockId;
            const sourceColumnIndex = item.sourceColumnIndex ?? item.columnIndex;
            if (typeof dragIndex !== 'number' || !sourceBlockId || sourceColumnIndex === undefined) return;
            const isSameColumn = sourceBlockId === blockId && sourceColumnIndex === columnIndex;
            if (isSameColumn && dragIndex === hoverIndex) return;

            if (isSameColumn && dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
            if (isSameColumn && dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

            const targetIndex = hoverClientY < hoverMiddleY ? hoverIndex : hoverIndex + 1;
            const nextIndex = isSameColumn && dragIndex < targetIndex ? targetIndex - 1 : targetIndex;
            dispatch(moveColumnContent({
                sourceBlockId,
                sourceColumnIndex,
                sourceIndex: dragIndex,
                targetBlockId: blockId,
                targetColumnIndex: columnIndex,
                targetIndex,
            }));
            item.blockId = blockId;
            item.columnIndex = columnIndex;
            item.sourceBlockId = blockId;
            item.sourceColumnIndex = columnIndex;
            item.index = nextIndex;
        },
        drop: (item: DragItem & { widgetType?: string }, monitor) => {
            if (!item.widgetType || !onInsertWidget || monitor.didDrop()) return;
            const insertIndex = insertPosition === 'before' ? widgetIndex : widgetIndex + 1;
            onInsertWidget(item, insertIndex);
            setInsertPosition(null);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver({ shallow: true }),
        }),
    });

    React.useEffect(() => {
        if (!isOver) {
            setInsertPosition(null);
        }
    }, [isOver]);

    drag(drop(ref));

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(copyColumnContent({ blockId, columnIndex, widgetIndex }));
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(deleteColumnContent({ blockId, columnIndex, widgetIndex }));
    };

    const handleContextMenu = (event: React.MouseEvent) => {
        if (previewMode) return;
        event.preventDefault();
        event.stopPropagation();
        setContextMenu(
            contextMenu === null
                ? {
                    mouseX: event.clientX - 2,
                    mouseY: event.clientY - 4,
                }
                : null,
        );
    };

    const handleClose = () => {
        setContextMenu(null);
    };

    const handleContextMenuEdit = () => {
        handleClose();
        onWidgetClick({} as any);
    };

    const handleContextMenuDuplicate = () => {
        handleClose();
        dispatch(copyColumnContent({ blockId, columnIndex, widgetIndex }));
    };

    const handleContextMenuCopy = () => {
        handleClose();
        if (widget) {
            dispatch(copyWidget({ contentType: widget.contentType, contentData: widget.contentData || '' }));
        }
    };

    const handleContextMenuPaste = () => {
        handleClose();
        dispatch(pasteCopiedWidget({ blockId, columnIndex, widgetIndex, nestedPath: null, insertInside: false }));
    };

    const handleContextMenuDelete = () => {
        handleClose();
        dispatch(deleteColumnContent({ blockId, columnIndex, widgetIndex }));
    };

    return (
        <Box
            ref={ref}
            id={`outline_${blockId}_${columnIndex}_${widgetIndex}_`}
            onContextMenu={handleContextMenu}
            sx={{
                position: 'relative',
                width: (resolvedDisplay === 'inline-block' || resolvedDisplay === 'inline') ? 'auto' : '100%',
                maxWidth: '100%',
                minWidth: 0,
                boxSizing: 'border-box',
                display: (resolvedDisplay === 'inline-block' || resolvedDisplay === 'inline') ? 'inline-flex' : (resolvedDisplay === 'none' && !previewMode ? 'flex' : resolvedDisplay),
                flexDirection: 'column',
                verticalAlign: 'top',
                alignItems: alignItems || 'stretch',
                opacity: isDragging ? 0.5 : (widgetDisplay === 'none' && !previewMode ? 0.5 : 1),
                border: widgetDisplay === 'none' && !previewMode ? '1px dashed #ef4444' : undefined,
                cursor: previewMode ? 'default' : 'grab',

                outline: isSelected ? '2px solid #2196F3' : 'none',
                outlineOffset: '-1px',
                '&:hover': {
                    '& .widget-actions': {
                        display: (!previewMode && !isDraggingGlobal) ? 'flex' : 'none',
                    }
                },
                zIndex: isSelected ? 2 : 1,
            }}
            onClick={(e) => {
                e.stopPropagation();
                onWidgetClick(e);
            }}
        >
            {!previewMode && insertPosition === 'before' && (
                <Box sx={{ position: 'absolute', top: -2, left: 0, right: 0, height: '4px', bgcolor: '#000000', borderRadius: '2px', zIndex: 10 }} />
            )}
            {!previewMode && (
                <Box
                    className="widget-actions"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        right: -55, // Float outside the 600px white box into the colored area
                        backgroundColor: '#2196F3',
                        borderRadius: '0 4px 4px 0', // Rounded on the right side now
                        display: isSelected ? 'flex' : 'none',
                        zIndex: 15, // Higher z-index to stay above block controls if they meet
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                >
                    <Tooltip title="Duplicate" placement="top">
                        <ContentCopyTwoToneIcon
                            sx={{ color: '#fff', fontSize: 20, p: 0.5, cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' } }}
                            onClick={handleCopy}
                        />
                    </Tooltip>
                    <Tooltip title="Delete" placement="top">
                        <DeleteOutlineTwoToneIcon
                            sx={{ color: '#fff', fontSize: 20, p: 0.5, cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' } }}
                            onClick={handleDelete}
                        />
                    </Tooltip>
                </Box>
            )}
            {children}
            {!previewMode && insertPosition === 'after' && (
                <Box sx={{ position: 'absolute', bottom: -2, left: 0, right: 0, height: '4px', bgcolor: '#000000', borderRadius: '2px', zIndex: 10 }} />
            )}

            <Menu
                open={contextMenu !== null}
                onClose={handleClose}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
                PaperProps={{
                    sx: {
                        minWidth: 160,
                        borderRadius: '6px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        border: '1px solid #e2e8f0',
                        py: 0.5,
                        zIndex: 10000000
                    }
                }}
            >
                <MenuItem onClick={handleContextMenuEdit} sx={{ fontSize: '12px', py: 0.75 }}>
                    <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Edit Widget" primaryTypographyProps={{ fontSize: '12px' }} />
                </MenuItem>
                <MenuItem onClick={handleContextMenuDuplicate} sx={{ fontSize: '12px', py: 0.75 }}>
                    <ListItemIcon><FileCopyIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Duplicate" primaryTypographyProps={{ fontSize: '12px' }} />
                </MenuItem>
                <MenuItem onClick={handleContextMenuCopy} sx={{ fontSize: '12px', py: 0.75 }}>
                    <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Copy" primaryTypographyProps={{ fontSize: '12px' }} />
                </MenuItem>
                <MenuItem
                    onClick={handleContextMenuPaste}
                    disabled={!copiedWidget}
                    sx={{ fontSize: '12px', py: 0.75 }}
                >
                    <ListItemIcon><ContentPasteIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary="Paste" primaryTypographyProps={{ fontSize: '12px' }} />
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleContextMenuDelete} sx={{ fontSize: '12px', py: 0.75, color: '#ef4444' }}>
                    <ListItemIcon><DeleteOutlineIcon fontSize="small" sx={{ color: '#ef4444' }} /></ListItemIcon>
                    <ListItemText primary="Delete" primaryTypographyProps={{ fontSize: '12px', color: '#ef4444' }} />
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default DraggableWidgetWrapper;
