import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { openEditor } from '../../../Store/Slice/workspaceSlice';
import { RootState } from '../../../Store/store';

interface SubElementWrapperProps {
  blockId: string;
  columnIndex: number;
  widgetIndex: number;
  contentType: string;
  subElementId: string;
  children: React.ReactNode;
  previewMode?: boolean;
  childProps?: Record<string, any>;
}

const SubElementWrapper: React.FC<SubElementWrapperProps> = ({
  blockId,
  columnIndex,
  widgetIndex,
  contentType,
  subElementId,
  children,
  previewMode = false,
  childProps = {},
}) => {
  const dispatch = useDispatch();
  const {
    selectedBlockForEditor,
    selectedColumnIndex,
    selectedContentType,
    selectedWidgetIndex,
    selectedSubElementId,
  } = useSelector((state: RootState) => state.workspace);

  const isParentSelected =
    selectedBlockForEditor === blockId &&
    selectedColumnIndex === columnIndex &&
    selectedContentType === contentType &&
    selectedWidgetIndex === widgetIndex;

  const isSelected = isParentSelected && selectedSubElementId === subElementId;
  const widgetOutlineId = `outline_${blockId}_${columnIndex}_${widgetIndex}_`;
  const subElementDOMId = `${widgetOutlineId}_sub_${subElementId}`;

  if (previewMode) {
    return <>{children}</>;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(
      openEditor({
        blockId,
        columnIndex,
        widgetIndex,
        contentType: contentType as any,
        selectedSubElementId: subElementId,
      })
    );
  };

  // Safe destructuring of children. Children must be a single React element to extract style.
  let child: React.ReactElement<any>;
  try {
    child = React.Children.only(children) as React.ReactElement<any>;
  } catch (e) {
    // Fallback if not a single element
    return (
      <Box
        id={subElementDOMId}
        onClick={handleClick}
        sx={{
          position: 'relative',
          width: '100%',
          boxSizing: 'border-box',
          cursor: isParentSelected ? 'pointer' : 'inherit',
          outline: isSelected
            ? '2px solid #9c27b0'
            : isParentSelected
            ? '1px dashed transparent'
            : 'none',
          outlineOffset: '-1px',
          transition: 'outline 0.2s ease',
          '&:hover': {
            outline: isSelected
              ? '2px solid #9c27b0'
              : isParentSelected
              ? '1px dashed #9c27b0'
              : 'none',
            '& .sub-element-action': {
              display: isParentSelected ? 'flex' : 'none',
            },
          },
        }}
      >
        {children}
      </Box>
    );
  }

  const {
    style: childStyle = {},
    sx: childSx = {},
    className: childClassName,
    children: childChildren,
    onClick: childOnClick,
    ...restChildProps
  } = child.props;

  const mergedChildStyle = {
    ...(typeof childSx === 'object' && !Array.isArray(childSx) ? childSx : {}),
    ...childStyle,
  };

  const combinedSx = {
    ...mergedChildStyle,
    position: child.type === 'tr' ? undefined : (mergedChildStyle.position || 'relative'),
    cursor: isParentSelected ? 'pointer' : 'inherit',
    outline: isSelected
      ? '2px solid #9c27b0'
      : isParentSelected
      ? '1px dashed transparent'
      : 'none',
    outlineOffset: '-1px',
    transition: 'outline 0.2s ease',
    '&:hover': {
      outline: isSelected
        ? '2px solid #9c27b0'
        : isParentSelected
        ? '1px dashed #9c27b0'
        : 'none',
      '& .sub-element-action': {
        display: isParentSelected ? 'flex' : 'none',
      },
    },
  };

  if (typeof child.type === 'string') {
    const { sx: injectedSx, ...injectedChildProps } = childProps;
    
    const isTr = child.type === 'tr';
    const finalSx = {
      ...combinedSx,
      ...(typeof injectedSx === 'object' && !Array.isArray(injectedSx) ? injectedSx : {}),
    };

    let processedChildren = childChildren;

    if (isTr && isSelected) {
      const childrenArray = React.Children.toArray(childChildren);
      let lastElementIndex = -1;
      for (let i = childrenArray.length - 1; i >= 0; i--) {
        if (React.isValidElement(childrenArray[i])) {
          lastElementIndex = i;
          break;
        }
      }

      if (lastElementIndex !== -1) {
        const lastChild = childrenArray[lastElementIndex] as React.ReactElement<any>;
        const lastChildProps = lastChild.props || {};
        const lastChildStyle = {
          ...(lastChildProps.style || {}),
          position: 'relative',
        };

        const newLastChild = React.cloneElement(
          lastChild,
          {
            style: lastChildStyle,
          },
          [
            ...(React.Children.toArray(lastChildProps.children)),
            <Box
              key="sub-element-action"
              className="sub-element-action"
              sx={{
                position: 'absolute',
                top: 2,
                right: 2,
                backgroundColor: '#9c27b0',
                color: '#fff',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                pointerEvents: 'none',
              }}
            >
              <EditIcon sx={{ fontSize: 10 }} />
            </Box>
          ]
        );

        childrenArray[lastElementIndex] = newLastChild;
        processedChildren = childrenArray;
      }
    }

    // Render Box directly as child.type tag (e.g. 'tr', 'table', 'td', 'div') to avoid invalid nesting and style layout issues.
    return (
      <Box
        id={subElementDOMId}
        component={child.type as any}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          if (childOnClick) childOnClick(e);
          dispatch(
            openEditor({
              blockId,
              columnIndex,
              widgetIndex,
              contentType: contentType as any,
              selectedSubElementId: subElementId,
            })
          );
        }}
        sx={finalSx}
        className={childClassName}
        {...restChildProps}
        {...injectedChildProps}
      >
        {processedChildren}
        {!isTr && isSelected && (
          <Box
            className="sub-element-action"
            sx={{
              position: 'absolute',
              top: 2,
              right: 2,
              backgroundColor: '#9c27b0',
              color: '#fff',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              pointerEvents: 'none',
            }}
          >
            <EditIcon sx={{ fontSize: 10 }} />
          </Box>
        )}
      </Box>
    );
  }

  // Fallback if child.type is a custom component
  const parentLayoutKeys = [
    'position', 'top', 'right', 'bottom', 'left', 'zIndex',
    'flex', 'flexGrow', 'flexShrink', 'flexBasis', 'width', 'height',
    'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'boxSizing', 'wordBreak', 'alignSelf', 'justifySelf', 'order'
  ];

  const extractedLayout: any = {};
  const cleanedChildStyle: any = { ...mergedChildStyle };

  parentLayoutKeys.forEach(key => {
    if (mergedChildStyle[key] !== undefined) {
      extractedLayout[key] = mergedChildStyle[key];
      delete cleanedChildStyle[key];
    }
  });

  const cleanedChild = React.cloneElement(child, {
    style: cleanedChildStyle,
    onClick: (e: React.MouseEvent) => {
      if (childOnClick) childOnClick(e);
    }
  });

  const borderRadius = mergedChildStyle.borderRadius !== undefined ? mergedChildStyle.borderRadius : undefined;

  return (
    <Box
      id={subElementDOMId}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(
          openEditor({
            blockId,
            columnIndex,
            widgetIndex,
            contentType: contentType as any,
            selectedSubElementId: subElementId,
          })
        );
      }}
      sx={{
        position: extractedLayout.position || 'relative',
        top: extractedLayout.top,
        right: extractedLayout.right,
        bottom: extractedLayout.bottom,
        left: extractedLayout.left,
        zIndex: extractedLayout.zIndex,
        flex: extractedLayout.flex,
        flexGrow: extractedLayout.flexGrow,
        flexShrink: extractedLayout.flexShrink,
        flexBasis: extractedLayout.flexBasis,
        width: extractedLayout.width,
        height: extractedLayout.height,
        margin: extractedLayout.margin,
        marginTop: extractedLayout.marginTop,
        marginRight: extractedLayout.marginRight,
        marginBottom: extractedLayout.marginBottom,
        marginLeft: extractedLayout.marginLeft,
        padding: extractedLayout.padding,
        paddingTop: extractedLayout.paddingTop,
        paddingRight: extractedLayout.paddingRight,
        paddingBottom: extractedLayout.paddingBottom,
        paddingLeft: extractedLayout.paddingLeft,
        alignSelf: extractedLayout.alignSelf,
        justifySelf: extractedLayout.justifySelf,
        order: extractedLayout.order,
        boxSizing: extractedLayout.boxSizing || 'border-box',
        wordBreak: extractedLayout.wordBreak,
        borderRadius: borderRadius,
        cursor: isParentSelected ? 'pointer' : 'inherit',
        outline: isSelected
          ? '2px solid #9c27b0'
          : isParentSelected
          ? '1px dashed transparent'
          : 'none',
        outlineOffset: '-1px',
        transition: 'outline 0.2s ease',
        '&:hover': {
          outline: isSelected
            ? '2px solid #9c27b0'
            : isParentSelected
            ? '1px dashed #9c27b0'
            : 'none',
          '& .sub-element-action': {
            display: isParentSelected ? 'flex' : 'none',
          },
        },
      }}
    >
      {isSelected && (
        <Box
          className="sub-element-action"
          sx={{
            position: 'absolute',
            top: 2,
            right: 2,
            backgroundColor: '#9c27b0',
            color: '#fff',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            pointerEvents: 'none',
          }}
        >
          <EditIcon sx={{ fontSize: 10 }} />
        </Box>
      )}
      {cleanedChild}
    </Box>
  );
};

export default SubElementWrapper;
