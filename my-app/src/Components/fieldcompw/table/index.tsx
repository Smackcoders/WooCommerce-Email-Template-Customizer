import React from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../Store/store';
import { defaultTableEditorOptions } from '../../../Store/Slice/workspaceSlice';

interface TableFieldComponentProps {
  blockId: string;
  columnIndex: number;
  isSelected: boolean;
  onClick: (e?: React.MouseEvent) => void;
  onWidgetClick?: (e: React.MouseEvent) => void;
  widgetIndex: number;
  widgetData?: any;
}

const TableFieldComponent: React.FC<TableFieldComponentProps> = ({
  blockId,
  columnIndex,
  isSelected,
  onClick,
  onWidgetClick,
  widgetIndex,
  widgetData
}) => {
  const storeTableOptions = useSelector((state: RootState) => state.workspace.tableEditorOptions);

  // Use live Redux state when editing (isSelected), saved contentData otherwise
  const tableEditorOptions = isSelected
    ? storeTableOptions
    : widgetData?.contentData
      ? { ...defaultTableEditorOptions, ...JSON.parse(widgetData.contentData) }
      : storeTableOptions;

  const rows = tableEditorOptions.rows || 2;
  const headings = tableEditorOptions.headings || [{ text: 'Heading 1' }, { text: 'Heading 2' }];
  const cols = headings.length;

  const getTdStyle = (rowIdx: number) => {
    const isEven = rowIdx % 2 === 0;
    const bgColor = isEven ? tableEditorOptions.rowBackgroundColorEven : tableEditorOptions.rowBackgroundColorOdd;
    const color = isEven ? tableEditorOptions.rowColorEven : tableEditorOptions.rowColorOdd;
    
    return {
      border: tableEditorOptions.rowBorderType && tableEditorOptions.rowBorderType !== 'default'
        ? tableEditorOptions.rowBorderType === 'none' ? 'none' : `${tableEditorOptions.borderWidth ?? 1}px ${tableEditorOptions.rowBorderType} ${tableEditorOptions.borderColor || '#cccccc'}`
        : `${tableEditorOptions.borderWidth ?? 1}px solid ${tableEditorOptions.borderColor || '#cccccc'}`,
      padding: tableEditorOptions.rowPadding ? `${tableEditorOptions.rowPadding.top}${tableEditorOptions.rowPaddingUnit || 'px'} ${tableEditorOptions.rowPadding.right}${tableEditorOptions.rowPaddingUnit || 'px'} ${tableEditorOptions.rowPadding.bottom}${tableEditorOptions.rowPaddingUnit || 'px'} ${tableEditorOptions.rowPadding.left}${tableEditorOptions.rowPaddingUnit || 'px'}` : `${tableEditorOptions.cellPadding ?? 8}px`,
      textAlign: tableEditorOptions.textAlign || 'left',
      backgroundColor: bgColor && bgColor !== 'transparent' ? bgColor : undefined,
      color: color || '#555555',
      fontFamily: tableEditorOptions.rowFontFamily && tableEditorOptions.rowFontFamily !== 'Global' ? tableEditorOptions.rowFontFamily : 'inherit',
      fontSize: tableEditorOptions.rowFontSize ? `${tableEditorOptions.rowFontSize}px` : undefined,
      fontWeight: tableEditorOptions.rowFontWeight || 'normal',
      textTransform: tableEditorOptions.rowTextTransform && tableEditorOptions.rowTextTransform !== 'none' ? tableEditorOptions.rowTextTransform as any : undefined,
      fontStyle: tableEditorOptions.rowFontStyle && tableEditorOptions.rowFontStyle !== 'normal' ? tableEditorOptions.rowFontStyle : undefined,
      textDecoration: tableEditorOptions.rowTextDecoration && tableEditorOptions.rowTextDecoration !== 'none' ? tableEditorOptions.rowTextDecoration : undefined,
      lineHeight: tableEditorOptions.rowLineHeight ? `${tableEditorOptions.rowLineHeight}px` : undefined,
      letterSpacing: tableEditorOptions.rowLetterSpacing ? `${tableEditorOptions.rowLetterSpacing}px` : undefined,
      wordSpacing: tableEditorOptions.rowWordSpacing ? `${tableEditorOptions.rowWordSpacing}px` : undefined,
    };
  };


  // Generate an array of rows and columns
  const tableRows = Array.from({ length: rows }, (_, i) => i);
  const tableCols = Array.from({ length: cols }, (_, i) => i);

  return (
    <Box
      onClick={(e) => {
        if (onWidgetClick) {
          onWidgetClick(e);
        } else if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
      sx={{
        width: '100%',
        marginTop: `${tableEditorOptions.margin?.top || 0}px`,
        marginBottom: `${tableEditorOptions.margin?.bottom || 0}px`,
        position: 'relative',
        cursor: 'pointer',
        textAlign: tableEditorOptions.tableAlign || 'center',
      }}
    >
      <table
        align={(tableEditorOptions.tableAlign as any) || 'center'}
        width={tableEditorOptions.width || '100%'}
        cellPadding={tableEditorOptions.cellPadding ?? 8}
        cellSpacing={tableEditorOptions.cellSpacing ?? 0}
        style={{
          width: tableEditorOptions.width || '100%',
          margin: (tableEditorOptions.tableAlign === 'left') ? '0 auto 0 0' : (tableEditorOptions.tableAlign === 'right' ? '0 0 0 auto' : '0 auto'),
          backgroundColor: tableEditorOptions.backgroundColor || 'transparent',
          borderCollapse: 'collapse',
          border: `${tableEditorOptions.borderWidth ?? 1}px ${tableEditorOptions.borderStyle || 'solid'} ${tableEditorOptions.borderColor || '#cccccc'}`,
          borderRadius: tableEditorOptions.borderRadius ? `${tableEditorOptions.borderRadius}${tableEditorOptions.borderRadiusUnit || 'px'}` : '0',
          boxShadow: tableEditorOptions.boxShadow || 'none',
        }}
      >
        <thead>
          <tr>
            {headings.map((heading: any, index: number) => (
              <th
                key={`th-${index}`}
                colSpan={heading.colSpan ? parseInt(heading.colSpan) : undefined}
                style={{
                  width: heading.width || undefined,
                  border: tableEditorOptions.headBorderType && tableEditorOptions.headBorderType !== 'default'
                    ? tableEditorOptions.headBorderType === 'none' ? 'none' : `${tableEditorOptions.borderWidth ?? 1}px ${tableEditorOptions.headBorderType} ${tableEditorOptions.borderColor || '#cccccc'}`
                    : `${tableEditorOptions.borderWidth ?? 1}px solid ${tableEditorOptions.borderColor || '#cccccc'}`,
                  padding: tableEditorOptions.headPadding ? `${tableEditorOptions.headPadding.top}${tableEditorOptions.headPaddingUnit || 'px'} ${tableEditorOptions.headPadding.right}${tableEditorOptions.headPaddingUnit || 'px'} ${tableEditorOptions.headPadding.bottom}${tableEditorOptions.headPaddingUnit || 'px'} ${tableEditorOptions.headPadding.left}${tableEditorOptions.headPaddingUnit || 'px'}` : `${tableEditorOptions.cellPadding ?? 8}px`,
                  textAlign: heading.textAlign || tableEditorOptions.textAlign || 'left',
                  backgroundColor: tableEditorOptions.headBackgroundColor || '#f5f5f5',
                  color: tableEditorOptions.headColor || '#333333',
                  fontFamily: tableEditorOptions.headFontFamily && tableEditorOptions.headFontFamily !== 'Global' ? tableEditorOptions.headFontFamily : 'inherit',
                  fontSize: tableEditorOptions.headFontSize ? `${tableEditorOptions.headFontSize}px` : undefined,
                  fontWeight: tableEditorOptions.headFontWeight || 'bold',
                  textTransform: tableEditorOptions.headTextTransform && tableEditorOptions.headTextTransform !== 'none' ? tableEditorOptions.headTextTransform as any : undefined,
                  fontStyle: tableEditorOptions.headFontStyle && tableEditorOptions.headFontStyle !== 'normal' ? tableEditorOptions.headFontStyle : undefined,
                  textDecoration: tableEditorOptions.headTextDecoration && tableEditorOptions.headTextDecoration !== 'none' ? tableEditorOptions.headTextDecoration : undefined,
                  lineHeight: tableEditorOptions.headLineHeight ? `${tableEditorOptions.headLineHeight}px` : undefined,
                  letterSpacing: tableEditorOptions.headLetterSpacing ? `${tableEditorOptions.headLetterSpacing}px` : undefined,
                  wordSpacing: tableEditorOptions.headWordSpacing ? `${tableEditorOptions.headWordSpacing}px` : undefined,
                }}
              >
                {heading.imageUrl && (
                  <img
                    src={heading.imageUrl}
                    alt={heading.text}
                    style={{ display: 'block', maxWidth: '100%', maxHeight: tableEditorOptions.headIconSize ? `${tableEditorOptions.headIconSize}px` : '60px', objectFit: 'contain', margin: tableEditorOptions.headIconSpacing ? `${tableEditorOptions.headIconSpacing.top}${tableEditorOptions.headIconSpacingUnit || 'px'} ${tableEditorOptions.headIconSpacing.right}${tableEditorOptions.headIconSpacingUnit || 'px'} ${tableEditorOptions.headIconSpacing.bottom}${tableEditorOptions.headIconSpacingUnit || 'px'} ${tableEditorOptions.headIconSpacing.left}${tableEditorOptions.headIconSpacingUnit || 'px'}` : (heading.text ? '0 0 4px 0' : '0') }}
                  />
                )}
                {heading.text}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(() => {
            // Use tableRows data (array of {text, type}) if available
            const rawTableRows: { text: string; type: 'row' | 'column' }[] = (tableEditorOptions as any).tableRows || [];
            if (rawTableRows.length === 0) {
              // Fallback: render numeric placeholder rows
              return Array.from({ length: rows }, (_, i) => (
                <tr key={`row-${i}`}>
                  {Array.from({ length: cols }, (_, j) => (
                    <td
                      key={`col-${j}`}
                      style={getTdStyle(i) as any}
                    >
                      Row {i + 1} Col {j + 1}
                    </td>
                  ))}
                </tr>
              ));
            }
                        // Group items: each 'row' type starts a new <tr>, column items are <td>s
            const groups: any[][] = [];
            let current: any[] = [];
            rawTableRows.forEach(item => {
              if (item.type === 'row') {
                if (current.length > 0) groups.push(current);
                current = [];
              } else {
                current.push(item);
              }
            });
            if (current.length > 0) groups.push(current);

            return groups.map((cells, rowIdx) => (
              <tr key={`row-${rowIdx}`}>
                {cells.map((cell, colIdx) => {
                  const tdContent = cell.text;
                  const innerContent = cell.link ? (
                    <a href={cell.link} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {tdContent}
                    </a>
                  ) : tdContent;
                  
                  return (
                    <td
                      key={`col-${colIdx}`}
                      colSpan={cell.colSpan ? parseInt(cell.colSpan) : undefined}
                      rowSpan={cell.rowSpan ? parseInt(cell.rowSpan) : undefined}
                      style={{
                        ...(getTdStyle(rowIdx) as any),
                        backgroundColor: cell.backgroundColor || (getTdStyle(rowIdx) as any).backgroundColor,
                        color: cell.color || (getTdStyle(rowIdx) as any).color,
                        textAlign: cell.textAlign || (getTdStyle(rowIdx) as any).textAlign,
                        width: cell.width || undefined
                      }}
                    >
                      {cell.imageUrl && (
                        <img 
                          src={cell.imageUrl} 
                          alt={cell.text || "Row Image"} 
                          style={{ display: 'block', maxWidth: '100%', maxHeight: cell.iconSize ? `${cell.iconSize}px` : '60px', objectFit: 'contain', margin: (cell.text ? '0 0 4px 0' : '0') }} 
                        />
                      )}
                      {innerContent}
                    </td>
                  );
                })}
              </tr>
            ));
          })()}
        </tbody>
      </table>
    </Box>
  );
};

export default TableFieldComponent;
