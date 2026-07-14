import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDrag, useDrop } from 'react-dnd';
import { RootState } from '../../../Store/store';
import { setBlocks, setSelectedBlockId } from '../../../Store/Slice/workspaceSlice';
import { defaultContactEditorOptions } from '../../../Store/Slice/workspaceSlice';
import { getSubElementSx, replaceDynamicVariables, getSpacingStyle } from '../../utils/treeHelper';
import SubElementWrapper from '../../WorkspaceColumn/workspaceArea/SubElementWrapper';
import HomeIcon from '@mui/icons-material/Home';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';



interface ContactFieldComponentProps {
    blockId: string;
    columnIndex: number;
    isSelected: boolean;
    onClick: () => void;
    onWidgetClick: (e: React.MouseEvent) => void;
    widgetIndex: number;
    previewMode?: boolean;
    widgetData?: any;
}

const defaultContactRowOrder = ['url', 'email', 'phone'];

interface ContactRowDragItem {
    type: 'CONTACT_ROW';
    rowId: string;
    index: number;
    widgetDragId: string;
}

interface DraggableContactRowProps {
    rowId: string;
    order: number;
    widgetDragId: string;
    previewMode: boolean;
    children: React.ReactNode;
    onMove: (dragRowId: string, hoverRowId: string) => void;
}

const DraggableContactRow: React.FC<DraggableContactRowProps> = ({
    rowId,
    order,
    widgetDragId,
    previewMode,
    children,
    onMove,
}) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const setInnerDragActive = (active: boolean) => {
        (window as any).__woomailerInnerElementDragActive = active;
    };

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'CONTACT_ROW',
        item: { type: 'CONTACT_ROW', rowId, index: order, widgetDragId },
        canDrag: !previewMode,
        end: () => setInnerDragActive(false),
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
    }), [rowId, order, widgetDragId, previewMode]);

    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'CONTACT_ROW',
        hover: (item: ContactRowDragItem) => {
            if (!ref.current || previewMode) return;
            if (item.widgetDragId !== widgetDragId || item.rowId === rowId) return;
            if (item.index === order) return;

            onMove(item.rowId, rowId);
            item.index = order;
        },
        collect: monitor => ({
            isOver: monitor.isOver({ shallow: true }),
        }),
    }), [rowId, order, widgetDragId, previewMode, onMove]);

    drag(drop(ref));

    return (
        <div
            ref={ref}
            onMouseDownCapture={e => {
                if (previewMode) return;
                setInnerDragActive(true);
                e.stopPropagation();
            }}
            onMouseUpCapture={() => setInnerDragActive(false)}
            onMouseLeave={() => {
                if (!isDragging) setInnerDragActive(false);
            }}
            style={{
                order,
                width: '100%',
                opacity: isDragging ? 0.45 : 1,
                cursor: previewMode ? 'inherit' : 'grab',
                outline: isOver ? '1px dashed #9c27b0' : 'none',
                outlineOffset: '-1px',
            }}
        >
            {children}
        </div>
    );
};

const getPreviewValue = (text: string | undefined): string => {
    return replaceDynamicVariables(text, true);
};

const ContactFieldComponent: React.FC<ContactFieldComponentProps> = ({
    blockId,
    columnIndex,
    isSelected,
    onClick,
    onWidgetClick,
    widgetIndex,
    previewMode = true,
    widgetData
}) => {
    const dispatch = useDispatch();
    const blocks = useSelector((state: RootState) => state.workspace.blocks);
    const block = blocks.find(b => b.id === blockId);
    const column = block?.columns[columnIndex];
    const storeWidget = column?.widgetContents?.[widgetIndex];
    const widget = widgetData || storeWidget;

    const options = React.useMemo(() => {
        if (widget && widget.contentData) {
            try {
                return { ...defaultContactEditorOptions, ...JSON.parse(widget.contentData) };
            } catch (e) {
                // Fail silently
            }
        }
        return defaultContactEditorOptions;
    }, [widget]);

    const align = options.textAlign || 'center';
    const justifyAlign = align === 'center' ? 'center' : (align === 'right' ? 'flex-end' : 'flex-start');
    const contactRowOrder = Array.isArray(options.contactRowOrder)
        ? [
            ...options.contactRowOrder.filter((rowId: string) => defaultContactRowOrder.includes(rowId)),
            ...defaultContactRowOrder.filter(rowId => !options.contactRowOrder.includes(rowId)),
        ]
        : defaultContactRowOrder;
    const contactRows = [
        {
            id: 'url',
            show: options.showUrl,
            subElementId: 'url_p',
            icon: <HomeIcon style={{ color: options.iconColor, fontSize: options.iconSize, marginRight: '8px' }} />,
            text: getPreviewValue(options.url),
            marginBottom: '8px',
        },
        {
            id: 'email',
            show: options.showEmail,
            subElementId: 'email_p',
            icon: <EmailIcon style={{ color: options.iconColor, fontSize: options.iconSize, marginRight: '8px' }} />,
            text: getPreviewValue(options.email),
            marginBottom: '8px',
        },
        {
            id: 'phone',
            show: options.showPhone,
            subElementId: 'phone_p',
            icon: <PhoneIcon style={{ color: options.iconColor, fontSize: options.iconSize, marginRight: '8px' }} />,
            text: getPreviewValue(options.phone),
            marginBottom: undefined,
        },
    ];
    const orderedContactRows = contactRowOrder
        .map(rowId => contactRows.find(row => row.id === rowId))
        .filter((row): row is typeof contactRows[number] => Boolean(row && row.show));
    const widgetDragId = `${blockId}:${columnIndex}:${widgetIndex}:contact`;

    const moveContactRow = React.useCallback((dragRowId: string, hoverRowId: string) => {
        const nextOrder = [...contactRowOrder];
        const dragIndex = nextOrder.indexOf(dragRowId);
        const hoverIndex = nextOrder.indexOf(hoverRowId);
        if (dragIndex === -1 || hoverIndex === -1 || dragIndex === hoverIndex) return;

        nextOrder.splice(dragIndex, 1);
        nextOrder.splice(hoverIndex, 0, dragRowId);

        const nextBlocks = JSON.parse(JSON.stringify(blocks));
        const nextBlock = nextBlocks.find((b: any) => b.id === blockId);
        const nextColumn = nextBlock?.columns?.[columnIndex];
        const nextWidget = nextColumn?.widgetContents?.[widgetIndex];
        if (!nextWidget || nextWidget.contentType !== 'contact') return;

        let nextData: any = {};
        try { nextData = JSON.parse(nextWidget.contentData || '{}'); } catch { nextData = {}; }
        nextData.contactRowOrder = nextOrder;
        nextWidget.contentData = JSON.stringify(nextData);
        dispatch(setBlocks(nextBlocks));
    }, [blockId, blocks, columnIndex, contactRowOrder, dispatch, widgetIndex]);

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                onWidgetClick(e);
                onClick();
                dispatch(setSelectedBlockId(blockId));
            }}
            style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: options.padding,
                margin: getSpacingStyle(options.margin, '0px'),
                backgroundColor: options.backgroundColor,
                border: isSelected ? '1px solid #2196f3' : '1px solid transparent',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: options.fontFamily,
                color: options.textColor,
                textAlign: options.textAlign as any,
                fontSize: options.fontSize,
                fontWeight: options.fontWeight,
                lineHeight: options.lineHeight ? `${options.lineHeight}px` : undefined,
                display: 'flex',
                flexDirection: 'column',
                ...getSubElementSx(options.subStyles, 'outer_container')
            }}
        >
            {orderedContactRows.map(row => (
                <DraggableContactRow key={row.id} rowId={row.id} order={contactRowOrder.indexOf(row.id)} widgetDragId={widgetDragId} previewMode={previewMode} onMove={moveContactRow}>
                    <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="contact" subElementId={row.subElementId} previewMode={previewMode}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: row.marginBottom,
                            justifyContent: justifyAlign,
                            ...getSubElementSx(options.subStyles, row.subElementId)
                        }}>
                            {row.icon}
                            <span style={{ fontSize: 'inherit' }}>{row.text}</span>
                        </div>
                    </SubElementWrapper>
                </DraggableContactRow>
            ))}
        </div>
    );
};

export default ContactFieldComponent;
