import React from 'react';
import { Box } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../Store/store';
import { setSelectedBlockId, defaultImageEditorOptions } from '../../../Store/Slice/workspaceSlice';
import { useCallback, useEffect, useRef } from 'react';

interface ImageFieldComponentProps {
  blockId: string;
  columnIndex: number;
  onClick: (e?: React.MouseEvent) => void;
  onWidgetClick: (e: React.MouseEvent) => void;
  widgetIndex: number;
  previewMode?: boolean;
  widgetData?: any;
}

const ImageFieldComponent: React.FC<ImageFieldComponentProps> = ({
  blockId,
  columnIndex,
  onClick,
  onWidgetClick,
  widgetIndex,
  widgetData
}) => {
  const dispatch = useDispatch();
  const contentRef = useRef<HTMLDivElement>(null);

  const storeWidgetContent = useSelector((state: RootState) =>
    state.workspace.blocks.find((block) => block.id === blockId)?.columns[columnIndex]?.widgetContents[widgetIndex] || null
  );

  const widgetContent = widgetData || storeWidgetContent;

  const imageOptions = widgetContent?.contentData
    ? { ...defaultImageEditorOptions, ...JSON.parse(widgetContent.contentData) }
    : defaultImageEditorOptions;

  // Ensure padding exists if it's missing from the JSON
  if (!imageOptions.padding) {
    imageOptions.padding = { top: 0, bottom: 0, left: 0, right: 0 };
  }



  const formatLength = (val: string | number | undefined) => {
    if (val === undefined || val === '') return undefined;
    if (typeof val === 'number') return `${val}px`;
    if (/^\d+$/.test(val)) return `${val}px`;
    return val;
  };

  const formattedWidth = formatLength(imageOptions.width);
  const formattedHeight = formatLength(imageOptions.height);

  const finalWidth = (imageOptions.autoWidth && formattedWidth === '100%') ? '100%' : (formattedWidth || '100%');
  const finalHeight = ((imageOptions.autoHeight ?? true) && formattedHeight === 'auto') ? 'auto' : (formattedHeight || 'auto');

  const borderRad = imageOptions.borderRadius !== undefined && typeof imageOptions.borderRadius === 'number' && imageOptions.borderRadius > 0
    ? `${imageOptions.borderRadius}px`
    : `${imageOptions.borderRadiusTop || 0}px ${imageOptions.borderRadiusRight || 0}px ${imageOptions.borderRadiusBottom || 0}px ${imageOptions.borderRadiusLeft || 0}px`;

  const imgElement = (
    <Box
      component="img"
      src={imageOptions.src}
      alt={imageOptions.altText}
      sx={{
        width: finalWidth,
        maxWidth: '100%',
        height: finalHeight,
        objectFit: imageOptions.objectFit || 'contain',
        display: 'inline-block',
        borderRadius: borderRad,
        borderTopWidth: `${imageOptions.borderTopWidth || 0}px`,
        borderTopStyle: imageOptions.borderTopStyle || 'none',
        borderTopColor: imageOptions.borderTopColor || 'transparent',
        borderRightWidth: `${imageOptions.borderRightWidth || 0}px`,
        borderRightStyle: imageOptions.borderRightStyle || 'none',
        borderRightColor: imageOptions.borderRightColor || 'transparent',
        borderBottomWidth: `${imageOptions.borderBottomWidth || 0}px`,
        borderBottomStyle: imageOptions.borderBottomStyle || 'none',
        borderBottomColor: imageOptions.borderBottomColor || 'transparent',
        borderLeftWidth: `${imageOptions.borderLeftWidth || 0}px`,
        borderLeftStyle: imageOptions.borderLeftStyle || 'none',
        borderLeftColor: imageOptions.borderLeftColor || 'transparent',
      }}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = 'https://cdn.tools.unlayer.com/image/placeholder.png';
      }}
    />
  );

  return (
    <Box
      ref={contentRef}
      onClick={(e) => {
        e.stopPropagation();
        if (onWidgetClick) {
          onWidgetClick(e);
        } else if (onClick) {
          onClick(e as any);
        }
      }}
      sx={{
        cursor: 'pointer',
        width: '100%',
        height: '100%', // Allow wrapper to stretch and fill column height
        textAlign: imageOptions.align,
        paddingTop: `${imageOptions.padding.top}px`,
        paddingBottom: `${imageOptions.padding.bottom}px`,
        paddingLeft: `${imageOptions.padding.left}px`,
        paddingRight: `${imageOptions.padding.right}px`,
        marginTop: `${imageOptions.margin?.top || 0}px`,
        marginBottom: `${imageOptions.margin?.bottom || 0}px`,
        marginLeft: `${imageOptions.margin?.left || 0}px`,
        marginRight: `${imageOptions.margin?.right || 0}px`,
        backgroundColor: imageOptions.backgroundColor || imageOptions.bgColor || 'transparent',
        backgroundImage: imageOptions.backgroundImage || imageOptions.bgImage ? `url("${imageOptions.backgroundImage || imageOptions.bgImage}")` : undefined,
        backgroundSize: imageOptions.backgroundSize || imageOptions.bgSize || 'cover',
        backgroundPosition: imageOptions.backgroundPosition || imageOptions.bgPosition || 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {imageOptions.linkUrl ? (
        <a href={imageOptions.linkUrl} target={imageOptions.linkTarget || '_self'} style={{ display: 'inline-block', width: finalWidth, maxWidth: '100%' }}>
          {imgElement}
        </a>
      ) : (
        imgElement
      )}
    </Box>
  );
};

export default ImageFieldComponent;