import React from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../Store/store';
import { setSelectedBlockId, defaultEmailHeaderEditorOptions } from '../../../Store/Slice/workspaceSlice';
import { getSubElementSx, replaceDynamicVariables, getSpacingStyle } from '../../utils/treeHelper';
import SubElementWrapper from '../../WorkspaceColumn/workspaceArea/SubElementWrapper';



interface EmailHeaderFieldComponentProps {
    blockId: string;
    columnIndex: number;
    isSelected: boolean;
    onClick: () => void;
    onWidgetClick: (e: React.MouseEvent) => void;
    widgetIndex: number;
    previewMode?: boolean;
    widgetData?: any;
}

const EmailHeaderFieldComponent: React.FC<EmailHeaderFieldComponentProps> = ({
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
    const block = useSelector((state: RootState) => state.workspace.blocks.find(b => b.id === blockId));
    const column = block?.columns[columnIndex];

    const options = React.useMemo(() => {
        if (widgetData && widgetData.contentData) {
            try {
                return { ...defaultEmailHeaderEditorOptions, ...JSON.parse(widgetData.contentData) };
            } catch (e) {
                console.error("Failed to parse header options", e);
            }
        }

        const contentData = column?.widgetContents?.[widgetIndex]?.contentData;
        if (contentData) {
            try {
                return { ...defaultEmailHeaderEditorOptions, ...JSON.parse(contentData) };
            } catch (e) {
                console.error("Failed to parse header options", e);
            }
        }
        return defaultEmailHeaderEditorOptions;
    }, [column, widgetIndex, widgetData]);

    const emailHeaderEditorOptions = options;

    const formattedHeight = emailHeaderEditorOptions?.height && emailHeaderEditorOptions.height !== 'auto'
        ? (isNaN(Number(emailHeaderEditorOptions.height)) ? emailHeaderEditorOptions.height : `${emailHeaderEditorOptions.height}px`)
        : undefined;
    const formattedWidth = emailHeaderEditorOptions?.width
        ? (isNaN(Number(emailHeaderEditorOptions.width)) ? emailHeaderEditorOptions.width : `${emailHeaderEditorOptions.width}px`)
        : '100%';

    const headerTitleStyles = emailHeaderEditorOptions?.subStyles?.header_title || {};

    // Helper: map 'left' | 'center' | 'right' → flex justifyContent value
    const alignToFlex = (align: string | undefined): string => {
        if (align === 'center') return 'center';
        if (align === 'right') return 'flex-end';
        return 'flex-start';
    };

    // logoLayoutSx carries layout structure props from subStyles.
    // NOTE: `display` is intentionally excluded – the wrapper must always be `display: flex`
    // so that justifyContent and alignItems continue to work regardless of what display value
    // the user picks in the SubElement editor for the image itself.
    // NOTE: `justifyContent` IS now included so that the Justify control in the SubElement
    // editor takes effect; it overrides the logoAlign-derived fallback when explicitly set.
    const logoLayoutSx: any = {};
    if (headerTitleStyles.flexDirection) logoLayoutSx.flexDirection = headerTitleStyles.flexDirection;
    if (headerTitleStyles.justifyContent) logoLayoutSx.justifyContent = headerTitleStyles.justifyContent;
    if (headerTitleStyles.alignItems) logoLayoutSx.alignItems = headerTitleStyles.alignItems;
    if (headerTitleStyles.flexWrap) logoLayoutSx.flexWrap = headerTitleStyles.flexWrap;
    if (headerTitleStyles.columnGap !== undefined && headerTitleStyles.columnGap !== '') {
        logoLayoutSx.columnGap = typeof headerTitleStyles.columnGap === 'number' || /^\d+$/.test(headerTitleStyles.columnGap) ? `${headerTitleStyles.columnGap}px` : headerTitleStyles.columnGap;
    }
    if (headerTitleStyles.rowGap !== undefined && headerTitleStyles.rowGap !== '') {
        logoLayoutSx.rowGap = typeof headerTitleStyles.rowGap === 'number' || /^\d+$/.test(headerTitleStyles.rowGap) ? `${headerTitleStyles.rowGap}px` : headerTitleStyles.rowGap;
    }

    const imgSx = { ...getSubElementSx(emailHeaderEditorOptions?.subStyles, 'header_title') };
    delete imgSx.display;
    delete imgSx.flexDirection;
    delete imgSx.justifyContent;
    delete imgSx.alignItems;
    delete imgSx.flexWrap;
    delete imgSx.columnGap;
    delete imgSx.rowGap;

    const parentFlexDir = emailHeaderEditorOptions?.subStyles?.header_container?.flexDirection || 'column';
    const childWidth = parentFlexDir === 'row' || parentFlexDir === 'row-reverse' ? 'auto' : '100%';

    // Resolved alignments for logo and title
    const logoJustify = alignToFlex(emailHeaderEditorOptions?.logoAlign || 'left');
    const titleJustify = alignToFlex(
        emailHeaderEditorOptions?.subStyles?.header_container?.textAlign ||
        emailHeaderEditorOptions?.textAlign ||
        'center'
    );

    return (
        <Box
            onClick={(e) => {
                e.stopPropagation();
                onWidgetClick(e);
                onClick();
                dispatch(setSelectedBlockId(blockId));
            }}
            style={{
                width: formattedWidth,
                height: formattedHeight,
                backgroundColor: emailHeaderEditorOptions?.backgroundColor || '#25A2D0',
                color: emailHeaderEditorOptions?.textColor || '#ffffff',
                margin: getSpacingStyle(emailHeaderEditorOptions?.margin, '0px'),
                padding: getSpacingStyle(emailHeaderEditorOptions?.padding, '15px'),
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                fontFamily: emailHeaderEditorOptions?.fontFamily === 'inherit' || !emailHeaderEditorOptions?.fontFamily ? 'inherit' : emailHeaderEditorOptions?.fontFamily,
                ...getSubElementSx(emailHeaderEditorOptions?.subStyles, 'outer_container')
            }}
        >
            <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="emailHeader" subElementId="header_container" previewMode={previewMode}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    ...getSubElementSx(emailHeaderEditorOptions?.subStyles, 'header_container')
                }}>

                    {emailHeaderEditorOptions?.title && (
                        <Box sx={{
                            display: 'flex',
                            justifyContent: titleJustify,
                            width: childWidth,
                        }}>
                            <Box
                                component="p"
                                sx={{
                                    margin: '8px 0 0 0',
                                    padding: 0,
                                    fontSize: emailHeaderEditorOptions?.fontSize || '28px',
                                    fontWeight: emailHeaderEditorOptions?.fontWeight || 'bold',
                                    fontFamily: emailHeaderEditorOptions?.fontFamily || 'Arial, sans-serif',
                                    color: emailHeaderEditorOptions?.textColor || '#ffffff',
                                    textAlign: (emailHeaderEditorOptions?.subStyles?.header_container?.textAlign || emailHeaderEditorOptions?.textAlign || 'center') as 'left' | 'center' | 'right',
                                    lineHeight: 1.3,
                                }}
                            >
                                {replaceDynamicVariables(emailHeaderEditorOptions.title)}
                            </Box>
                        </Box>
                    )}
                </Box>
            </SubElementWrapper>
        </Box>
    );
};

export default EmailHeaderFieldComponent;
