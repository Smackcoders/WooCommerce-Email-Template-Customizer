import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../Store/store';
import { setSelectedBlockId, defaultCtaButtonEditorOptions } from '../../../Store/Slice/workspaceSlice';
import { getSubElementSx, replaceDynamicVariables } from '../../utils/treeHelper';
import SubElementWrapper from '../../WorkspaceColumn/workspaceArea/SubElementWrapper';

const getSpacingStyle = (spacing: any, defaultVal: string = '0px') => {
  if (!spacing) return defaultVal;
  if (typeof spacing === 'string') return spacing;
  return `${spacing.top || 0}px ${spacing.right || 0}px ${spacing.bottom || 0}px ${spacing.left || 0}px`;
};



interface CtaButtonFieldComponentProps {
    blockId: string;
    columnIndex: number;
    isSelected: boolean;
    onClick: () => void;
    onWidgetClick: (e: React.MouseEvent) => void;
    widgetIndex: number;
    previewMode?: boolean;
    widgetData?: any;
}

const CtaButtonFieldComponent: React.FC<CtaButtonFieldComponentProps> = ({
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
                return { ...defaultCtaButtonEditorOptions, ...JSON.parse(widgetData.contentData) };
            } catch (e) {
            }
        }

        const contentData = column?.widgetContents?.[widgetIndex]?.contentData;
        if (contentData) {
            try {
                return { ...defaultCtaButtonEditorOptions, ...JSON.parse(contentData) };
            } catch (e) {
                // Fail silently
            }
        }
        return defaultCtaButtonEditorOptions;
    }, [column, widgetIndex, widgetData]);

    const ctaButtonEditorOptions = options;
    const fallback = (value: string, placeholder: string) => value?.trim() || placeholder;

    const handleButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

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
                padding: getSpacingStyle(ctaButtonEditorOptions?.padding, '0px'),
                margin: getSpacingStyle(ctaButtonEditorOptions?.margin, '0px'),
                textAlign: (ctaButtonEditorOptions?.textAlign || ctaButtonEditorOptions?.alignment || 'center') as any,
                cursor: 'pointer',
                ...getSubElementSx(ctaButtonEditorOptions?.subStyles, 'outer_container')
            }}
        >
            <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="ctaButton" subElementId="button_container" previewMode={previewMode}>
                <div style={{
                    display: 'inline-block',
                    width: ctaButtonEditorOptions?.widthAuto === false && ctaButtonEditorOptions?.width !== undefined
                        ? `${ctaButtonEditorOptions.width}%`
                        : 'auto',
                    ...getSubElementSx(ctaButtonEditorOptions?.subStyles, 'button_container')
                }}>
                    <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="ctaButton" subElementId="button_elem" previewMode={previewMode}>
                        <button
                            onClick={handleButtonClick}
                            style={{
                                border: 'none',
                                outline: 'none',
                                cursor: 'pointer',
                                backgroundColor: ctaButtonEditorOptions?.backgroundColor || '#4CAF50',
                                color: ctaButtonEditorOptions?.textColor || '#ffffff',
                                fontSize: ctaButtonEditorOptions?.fontSize || '16px',
                                fontWeight: ctaButtonEditorOptions?.fontWeight || 'bold',
                                padding: ctaButtonEditorOptions?.buttonPadding || '12px 30px',
                                borderRadius: ctaButtonEditorOptions?.borderRadius || '5px',
                                textTransform: 'none',
                                fontFamily: ctaButtonEditorOptions?.fontFamily === 'inherit' || !ctaButtonEditorOptions?.fontFamily ? 'inherit' : ctaButtonEditorOptions?.fontFamily,
                                minWidth: ctaButtonEditorOptions?.minWidth || '200px',
                                width: ctaButtonEditorOptions?.widthAuto === false ? '100%' : undefined,
                                display: 'inline-block',
                                textAlign: 'center',
                                boxSizing: 'border-box',
                                ...getSubElementSx(ctaButtonEditorOptions?.subStyles, 'button_elem')
                            }}
                        >
                            {replaceDynamicVariables(fallback(ctaButtonEditorOptions?.buttonText, '{{button_text}}'))}
                        </button>
                    </SubElementWrapper>
                </div>
            </SubElementWrapper>
        </div>
    );
};

export default CtaButtonFieldComponent;
