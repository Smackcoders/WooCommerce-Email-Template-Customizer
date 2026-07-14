import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { getWidgetComponent } from '../../utils/getWidgetComponent';
import { IconButton, Typography } from '@mui/material';
import React, { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../Store/store";
import { getElementSx, replaceDynamicVariables } from "../../utils/treeHelper";
import { defaultTextEditorOptions, updateWidgetContentData, openEditor } from "../../../Store/Slice/workspaceSlice";
import { useDrop } from "react-dnd";

interface TextFieldComponentProps {
    blockId: string;
    columnIndex: number;
    widgetIndex: number;
    onClick?: (e?: React.MouseEvent) => void;
    onWidgetClick?: (e: React.MouseEvent) => void;
    isSelected?: boolean;
    widgetData?: any;
    path?: Array<{ colIdx: number; childIdx: number }>;
}

const TextFieldComponent: React.FC<TextFieldComponentProps> = ({
    blockId,
    columnIndex,
    widgetIndex,
    onClick,
    onWidgetClick,
    isSelected,
    widgetData,
    path = []
}) => {
    const dispatch = useDispatch();
    const dropRef = useRef<HTMLDivElement>(null);
    const selectedNestedPath = useSelector((state: RootState) => state.workspace.selectedNestedPath);
    const { blocks, selectedSubElementId } = useSelector((state: RootState) => state.workspace);
    const storeBlock = blocks.find((b) => b.id === blockId);
    const storeColumn = storeBlock?.columns[columnIndex];
    const storeWidget = storeColumn?.widgetContents[widgetIndex];

    const widget = widgetData || storeWidget;

    const content = widget?.contentData
        ? { ...defaultTextEditorOptions, ...JSON.parse(widget.contentData) }
        : defaultTextEditorOptions;

    const isCurrentSelection = (childIdx: number) => {
        if (!selectedNestedPath || selectedNestedPath.length !== path.length + 1) return false;
        for (let i = 0; i < path.length; i++) {
            if (selectedNestedPath[i].colIdx !== path[i].colIdx || selectedNestedPath[i].childIdx !== path[i].childIdx) return false;
        }
        const lastPart = selectedNestedPath[selectedNestedPath.length - 1];
        return lastPart.colIdx === -1 && lastPart.childIdx === childIdx;
    };

    const handleDeleteChild = (e: React.MouseEvent, childIndex: number) => {
        e.stopPropagation();
        const updatedChildren = (content.children || []).filter((_: any, idx: number) => idx !== childIndex);
        const updatedData = { ...content, children: updatedChildren };

        dispatch(updateWidgetContentData({
            blockId,
            columnIndex,
            widgetIndex,
            data: JSON.stringify(updatedData),
            nestedPath: path
        }));
    };

    const [{ isOver }, drop] = useDrop(() => ({
        accept: ['content'],
        canDrop: (item: any) => item.widgetType === 'link',
        drop: (item: any, monitor) => {
            if (monitor.didDrop()) return;
            const linkText = item.customData?.text || 'Click here';
            const linkUrl = item.customData?.url || '#';
            const linkColor = item.customData?.color || '#007bff';
            const underline = item.customData?.underline || false;
            
            const newChildData = {
                text: linkText,
                url: linkUrl,
                color: linkColor,
                underline,
                fontFamily: 'global',
                fontSize: content.fontSize || 14,
                fontWeight: 'normal',
                widthAuto: true,
                display: 'inline-block',
            };

            const newChild = {
                id: `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                contentType: 'link',
                contentData: JSON.stringify(newChildData)
            };

            const updatedOptions = {
                ...content,
                children: [...(content.children || []), newChild]
            };
            
            dispatch(
                updateWidgetContentData({
                    blockId,
                    columnIndex,
                    widgetIndex,
                    data: JSON.stringify(updatedOptions),
                    nestedPath: path
                })
            );
        },
        collect: (monitor) => ({
            isOver: monitor.isOver({ shallow: true }),
        }),
    }), [content, blockId, columnIndex, widgetIndex, dispatch, path]);

    drop(dropRef);

    if (!widget || widget.contentType !== "text") return null;

    const sxStyles = {
        ...getElementSx(content),
        whiteSpace: "pre-wrap",
        "& p, & h1, & h2, & h3, & h4, & h5, & h6": {
            margin: 0,
        },
        ...(selectedSubElementId && {
            [`& #${selectedSubElementId}`]: {
                outline: '2px dashed orange',
                borderRadius: '2px',
                padding: '1px 2px',
                backgroundColor: '#f0f8ff',
            }
        })
    };

    const handleClick = (e: React.MouseEvent) => {
        if (onWidgetClick) {
            onWidgetClick(e);
        } else if (onClick) {
            e.stopPropagation();
            onClick(e);
        }
    };

    return (
        <div
            ref={dropRef}
            onClick={handleClick}
            style={{
                cursor: "pointer",
                width: "100%",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                border: isSelected && !selectedSubElementId ? '2px dashed blue' : (isOver ? '2px dashed green' : 'none'),
            }}
        >
            <Typography component="div" sx={sxStyles}>
                <span dangerouslySetInnerHTML={{ __html: replaceDynamicVariables(content.content || '') }} />
                {content.children?.map((child: any, idx: number) => {
                    const WidgetComponent = getWidgetComponent(child.contentType);
                    if (!WidgetComponent) return null;
                    const isChildSelected = isCurrentSelection(idx);
                    const childPath = [...path, { colIdx: -1, childIdx: idx }];
                    return (
                        <span
                            key={child.id || idx}
                            style={{
                                position: 'relative',
                                display: 'inline-block',
                                marginLeft: '8px',
                                marginRight: '8px',
                                verticalAlign: 'middle',
                            }}
                        >
                            <span style={{ pointerEvents: 'none' }}>
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
                            </span>
                            <span
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
                            {isChildSelected && (
                                <span
                                    style={{
                                        position: 'absolute',
                                        right: -8,
                                        top: -16,
                                        backgroundColor: 'white',
                                        borderRadius: '50%',
                                        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                                        zIndex: 10,
                                        cursor: 'pointer',
                                        display: 'inline-flex'
                                    }}
                                >
                                    <IconButton size="small" style={{ padding: '2px' }} onClick={(e) => handleDeleteChild(e, idx)}>
                                        <CloseIcon style={{ fontSize: '12px' }} color="error" />
                                    </IconButton>
                                </span>
                            )}
                        </span>
                    );
                })}
            </Typography>
        </div>
    );
};

export default TextFieldComponent;
