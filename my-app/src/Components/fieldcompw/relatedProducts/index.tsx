import React from 'react';
import { Box, Typography, Card, CardMedia, CardContent, Button } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../Store/store';
import { setSelectedBlockId, defaultRelatedProductsEditorOptions } from '../../../Store/Slice/workspaceSlice';
import { getSubElementSx, replaceDynamicVariables } from '../../utils/treeHelper';
import SubElementWrapper from '../../WorkspaceColumn/workspaceArea/SubElementWrapper';

const getSpacingStyle = (spacing: any, defaultVal: string = '0px') => {
  if (!spacing) return defaultVal;
  if (typeof spacing === 'string') return spacing;
  return `${spacing.top || 0}px ${spacing.right || 0}px ${spacing.bottom || 0}px ${spacing.left || 0}px`;
};



interface RelatedProductsFieldComponentProps {
    blockId: string;
    columnIndex: number;
    isSelected: boolean;
    onClick: () => void;
    onWidgetClick: (e: React.MouseEvent) => void;
    widgetIndex: number;
    previewMode?: boolean;
    widgetData?: any;
}

const RelatedProductsFieldComponent: React.FC<RelatedProductsFieldComponentProps> = ({
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
                return { ...defaultRelatedProductsEditorOptions, ...JSON.parse(widget.contentData) };
            } catch (e) {
                console.error("Failed to parse relatedProducts options", e);
            }
        }
        return defaultRelatedProductsEditorOptions;
    }, [widget]);

    const relatedProductsEditorOptions = options;
    const fallback = (value: string, placeholder: string) => value?.trim() || placeholder;

    const sampleProducts = [
        {
            name: 'Wireless Mouse',
            price: '$29.99',
            image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=300&h=300&fit=crop'
        },
        {
            name: 'USB-C Hub',
            price: '$49.99',
            image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=300&h=300&fit=crop'
        },
        {
            name: 'Laptop Stand',
            price: '$39.99',
            image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop'
        },
        {
            name: 'Mechanical Keyboard',
            price: '$129.99',
            image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=300&h=300&fit=crop'
        }
    ];

    const products = React.useMemo(() => {
        if (relatedProductsEditorOptions?.useManualData) {
            return [
                {
                    name: relatedProductsEditorOptions.p1_name || (previewMode ? 'Product 1' : '{{product_name_1}}'),
                    price: relatedProductsEditorOptions.p1_price || (previewMode ? '$0.00' : '{{product_price_1}}'),
                    image: relatedProductsEditorOptions.p1_image || (previewMode ? 'https://via.placeholder.com/300' : '{{product_image_1}}'),
                    url: relatedProductsEditorOptions.p1_url || '#'
                },
                {
                    name: relatedProductsEditorOptions.p2_name || (previewMode ? 'Product 2' : '{{product_name_2}}'),
                    price: relatedProductsEditorOptions.p2_price || (previewMode ? '$0.00' : '{{product_price_2}}'),
                    image: relatedProductsEditorOptions.p2_image || (previewMode ? 'https://via.placeholder.com/300' : '{{product_image_2}}'),
                    url: relatedProductsEditorOptions.p2_url || '#'
                },
                {
                    name: relatedProductsEditorOptions.p3_name || (previewMode ? 'Product 3' : '{{product_name_3}}'),
                    price: relatedProductsEditorOptions.p3_price || (previewMode ? '$0.00' : '{{product_price_3}}'),
                    image: relatedProductsEditorOptions.p3_image || (previewMode ? 'https://via.placeholder.com/300' : '{{product_image_3}}'),
                    url: relatedProductsEditorOptions.p3_url || '#'
                },
                {
                    name: relatedProductsEditorOptions.p4_name || (previewMode ? 'Product 4' : '{{product_name_4}}'),
                    price: relatedProductsEditorOptions.p4_price || (previewMode ? '$0.00' : '{{product_price_4}}'),
                    image: relatedProductsEditorOptions.p4_image || (previewMode ? 'https://via.placeholder.com/300' : '{{product_image_4}}'),
                    url: relatedProductsEditorOptions.p4_url || '#'
                }
            ];
        }

        return previewMode ? sampleProducts : [
            { name: '{{product_name_1}}', price: '{{product_price_1}}', image: '{{product_image_1}}' },
            { name: '{{product_name_2}}', price: '{{product_price_2}}', image: '{{product_image_2}}' },
            { name: '{{product_name_3}}', price: '{{product_price_3}}', image: '{{product_image_3}}' },
            { name: '{{product_name_4}}', price: '{{product_price_4}}', image: '{{product_image_4}}' }
        ];
    }, [previewMode, relatedProductsEditorOptions, sampleProducts]);

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
                padding: getSpacingStyle(relatedProductsEditorOptions?.padding, '0px'),
                margin: getSpacingStyle(relatedProductsEditorOptions?.margin, '0px'),
                backgroundColor: relatedProductsEditorOptions?.backgroundColor || '#f9f9f9',
                border: isSelected ? '2px dashed blue' : 'none',
                cursor: 'pointer',
                fontFamily: relatedProductsEditorOptions?.fontFamily === 'inherit' || !relatedProductsEditorOptions?.fontFamily ? 'inherit' : relatedProductsEditorOptions?.fontFamily,
                fontSize: relatedProductsEditorOptions?.fontSize || '14px',
                ...getSubElementSx(relatedProductsEditorOptions?.subStyles, 'outer_container')
            }}
        >
            {/* Title */}
            <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="relatedProducts" subElementId="title_header" previewMode={previewMode}>
                <Typography
                    variant="h5"
                    sx={{
                        textAlign: 'center',
                        marginBottom: '20px',
                        fontWeight: relatedProductsEditorOptions?.titleFontWeight || 'bold',
                        color: relatedProductsEditorOptions?.titleColor || '#333',
                        ...getSubElementSx(relatedProductsEditorOptions?.subStyles, 'title_header')
                    }}
                >
                    {replaceDynamicVariables(fallback(relatedProductsEditorOptions?.title, '{{related_products_title}}'))}
                </Typography>
            </SubElementWrapper>

            {/* Products Grid */}
            <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="relatedProducts" subElementId="products_container" previewMode={previewMode}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', ...getSubElementSx(relatedProductsEditorOptions?.subStyles, 'products_container') }}>
                    {products.slice(0, relatedProductsEditorOptions?.productsToShow || 3).map((product, index) => (
                        <SubElementWrapper key={index} blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="relatedProducts" subElementId="product_card" previewMode={previewMode}>
                            <Box
                                sx={{
                                    width: { xs: '100%', sm: '30%' },
                                    flexGrow: 1,
                                    minWidth: '200px',
                                    ...getSubElementSx(relatedProductsEditorOptions?.subStyles, 'product_card')
                                }}
                            >
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        boxShadow: relatedProductsEditorOptions?.showCardShadow !== false
                                            ? (relatedProductsEditorOptions?.cardShadow || '0 2px 4px rgba(0,0,0,0.1)')
                                            : 'none',
                                    }}
                                >
                                    {relatedProductsEditorOptions?.showImages !== false && (
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={replaceDynamicVariables(product.image)}
                                            alt={replaceDynamicVariables(product.name)}
                                            sx={{ objectFit: 'cover' }}
                                        />
                                    )}
                                    <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                                        <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="relatedProducts" subElementId="product_title" previewMode={previewMode}>
                                            <Typography variant="h6" sx={{ fontSize: '16px', marginBottom: '8px', ...getSubElementSx(relatedProductsEditorOptions?.subStyles, 'product_title') }}>
                                                {replaceDynamicVariables(product.name)}
                                            </Typography>
                                        </SubElementWrapper>
                                        
                                        <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="relatedProducts" subElementId="product_price" previewMode={previewMode}>
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    color: relatedProductsEditorOptions?.priceColor || '#4CAF50',
                                                    fontWeight: 'bold',
                                                    marginBottom: '10px',
                                                    ...getSubElementSx(relatedProductsEditorOptions?.subStyles, 'product_price')
                                                }}
                                            >
                                                {replaceDynamicVariables(product.price)}
                                            </Typography>
                                        </SubElementWrapper>

                                        <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="relatedProducts" subElementId="product_button" previewMode={previewMode}>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                sx={{
                                                    backgroundColor: relatedProductsEditorOptions?.buttonColor || '#4CAF50',
                                                    color: '#fff',
                                                    '&:hover': {
                                                        backgroundColor: relatedProductsEditorOptions?.buttonHoverColor || '#45a049',
                                                    },
                                                    ...getSubElementSx(relatedProductsEditorOptions?.subStyles, 'product_button')
                                                }}
                                            >
                                                {replaceDynamicVariables(relatedProductsEditorOptions?.buttonText || 'View Product')}
                                            </Button>
                                        </SubElementWrapper>
                                    </CardContent>
                                </Card>
                            </Box>
                        </SubElementWrapper>
                    ))}
                </Box>
            </SubElementWrapper>
        </Box>
    );
};

export default RelatedProductsFieldComponent;
