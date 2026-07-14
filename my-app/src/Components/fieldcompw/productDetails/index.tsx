import React from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../Store/store';
import { setSelectedBlockId, defaultProductDetailsEditorOptions } from '../../../Store/Slice/workspaceSlice';
import { getSubElementSx, replaceDynamicVariables, getSpacingStyle } from '../../utils/treeHelper';
import SubElementWrapper from '../../WorkspaceColumn/workspaceArea/SubElementWrapper';



interface ProductDetailsFieldComponentProps {
    blockId: string;
    columnIndex: number;
    isSelected: boolean;
    onClick: () => void;
    onWidgetClick: (e: React.MouseEvent) => void;
    widgetIndex: number;
    previewMode?: boolean;
    widgetData?: any;
}

const ProductDetailsFieldComponent: React.FC<ProductDetailsFieldComponentProps> = ({
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
    const storeWidget = column?.widgetContents?.[widgetIndex];
    const widget = widgetData || storeWidget;

    const options = React.useMemo(() => {
        if (widget && widget.contentData) {
            try {
                return { ...defaultProductDetailsEditorOptions, ...JSON.parse(widget.contentData) };
            } catch (e) {
                // Fail silently
            }
        }
        return defaultProductDetailsEditorOptions;
    }, [widget]);
    const fallback = (val: string | number | undefined, placeholder: string | number) =>
        val === '' || val === null || val === undefined ? placeholder : val;

    return (
        <Box
            onClick={(e) => {
                e.stopPropagation();
                onWidgetClick(e);
                onClick();
                dispatch(setSelectedBlockId(blockId));
            }}
            sx={{
                width: '100%',
                padding: getSpacingStyle(options.padding, '0px'),
                margin: getSpacingStyle(options.margin, '0px'),
                backgroundColor: options.backgroundColor,
                fontFamily: options.fontFamily || 'inherit',
                fontSize: options.fontSize || '14px',
                textAlign: options.textAlign as any || 'left',
                border: '1px solid transparent',
                borderRadius: '4px',
                cursor: 'pointer',
                color: options.textColor,
                ...getSubElementSx(options.subStyles, 'outer_container')
            }}
        >
            <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="productDetails" subElementId="table_container" previewMode={previewMode}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'inherit', fontFamily: 'inherit', ...getSubElementSx(options.subStyles, 'table_container') }}>
                    <thead>
                        <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="productDetails" subElementId="header_row" previewMode={previewMode}>
                            <tr style={{ backgroundColor: options.headerBackgroundColor, color: options.headerTextColor, ...getSubElementSx(options.subStyles, 'header_row') }}>
                                {options.showImage !== false && (
                                    <th style={{ padding: '8px', borderBottom: `1px solid ${options.borderColor}`, textAlign: 'left', width: '60px' }}>
                                        Image
                                    </th>
                                )}
                                <th style={{ padding: '8px', borderBottom: `1px solid ${options.borderColor}`, textAlign: 'left', ...getSubElementSx(options.subStyles, 'header_product') }}>
                                    <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="productDetails" subElementId="header_product" previewMode={previewMode}>
                                        {replaceDynamicVariables(fallback(options.productHeader, 'Product'))}
                                    </SubElementWrapper>
                                </th>
                                <th style={{ padding: '8px', borderBottom: `1px solid ${options.borderColor}`, textAlign: 'left', ...getSubElementSx(options.subStyles, 'header_quantity') }}>
                                    <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="productDetails" subElementId="header_quantity" previewMode={previewMode}>
                                        {replaceDynamicVariables(fallback(options.quantityHeader, 'Quantity'))}
                                    </SubElementWrapper>
                                </th>
                                <th style={{ padding: '8px', borderBottom: `1px solid ${options.borderColor}`, textAlign: 'right', ...getSubElementSx(options.subStyles, 'header_price') }}>
                                    <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="productDetails" subElementId="header_price" previewMode={previewMode}>
                                        {replaceDynamicVariables(fallback(options.priceHeader, 'Price'))}
                                    </SubElementWrapper>
                                </th>
                            </tr>
                        </SubElementWrapper>
                    </thead>
                    <tbody>
                        {[
                            { nameVar: '{{product_name_1}}', priceVar: '{{product_price_1}}', qty: '1', imgVar: '{{product_image_1}}' },
                            { nameVar: '{{product_name_2}}', priceVar: '{{product_price_2}}', qty: '2', imgVar: '{{product_image_2}}' },
                        ].map((item, rowIdx) => (
                            <SubElementWrapper key={rowIdx} blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="productDetails" subElementId="item_row" previewMode={previewMode}>
                                <tr style={getSubElementSx(options.subStyles, 'item_row')}>
                                    {options.showImage !== false && (
                                        <td style={{ padding: '8px', border: `1px solid ${options.borderColor}`, textAlign: 'center', width: '60px' }}>
                                            <Box
                                                component="img"
                                                src="https://cdn.tools.unlayer.com/image/placeholder.png"
                                                alt="Product"
                                                sx={{ width: 48, height: 48, objectFit: 'contain', borderRadius: '4px', border: '1px solid #eee' }}
                                            />
                                        </td>
                                    )}
                                    <td style={{ padding: '12px', border: `1px solid ${options.borderColor}`, ...getSubElementSx(options.subStyles, 'item_product') }}>
                                        <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="productDetails" subElementId="item_product" previewMode={previewMode}>
                                            {replaceDynamicVariables(options.productPlaceholder === '{{product_name}}' || !options.productPlaceholder ? item.nameVar : options.productPlaceholder)}
                                        </SubElementWrapper>
                                    </td>
                                    <td style={{ padding: '12px', border: `1px solid ${options.borderColor}`, textAlign: 'center', ...getSubElementSx(options.subStyles, 'item_quantity') }}>
                                        <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="productDetails" subElementId="item_quantity" previewMode={previewMode}>
                                            {replaceDynamicVariables(options.quantityPlaceholder === '{{quantity}}' || !options.quantityPlaceholder ? item.qty : options.quantityPlaceholder)}
                                        </SubElementWrapper>
                                    </td>
                                    <td style={{ padding: '12px', border: `1px solid ${options.borderColor}`, textAlign: 'right', ...getSubElementSx(options.subStyles, 'item_price') }}>
                                        <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="productDetails" subElementId="item_price" previewMode={previewMode}>
                                            {replaceDynamicVariables(options.pricePlaceholder === '{{price}}' || !options.pricePlaceholder ? item.priceVar : options.pricePlaceholder)}
                                        </SubElementWrapper>
                                    </td>
                                </tr>
                            </SubElementWrapper>
                        ))}
                    </tbody>
                </table>
            </SubElementWrapper>
        </Box >
    );
};

export default ProductDetailsFieldComponent;
