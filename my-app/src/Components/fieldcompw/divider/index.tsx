import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../Store/store';
import { defaultDividerEditorOptions, DividerEditorOptions } from '../../../Store/Slice/workspaceSlice';
import { getSpacingStyle } from '../../utils/treeHelper';


interface DividerFieldComponentProps {
  blockId: string;
  columnIndex: number;
  onClick: (e?: React.MouseEvent) => void;
  onWidgetClick: (e: React.MouseEvent) => void;
  widgetIndex: number;
  previewMode?: boolean;
  widgetData?: any;
}

const DividerFieldComponent: React.FC<DividerFieldComponentProps> = ({ blockId, columnIndex, onClick, onWidgetClick, widgetIndex, widgetData }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const storeWidgetContent = useSelector((state: RootState) => {
    const block = state.workspace.blocks.find((b) => b.id === blockId);
    return block?.columns[columnIndex]?.widgetContents[widgetIndex] || null;
  });

  const finalContentData = widgetData ? widgetData.contentData : storeWidgetContent?.contentData;

  const dividerOptions: DividerEditorOptions = finalContentData
    ? { ...defaultDividerEditorOptions, ...JSON.parse(finalContentData) }
    : defaultDividerEditorOptions;

  const { width, style, thickness, color, alignment, padding } = dividerOptions;

  return (
    <div
      ref={contentRef}
      onClick={(e) => {
        e.stopPropagation();
        if (onWidgetClick) {
          onWidgetClick(e);
        } else if (onClick) {
          onClick();
        }
      }}
      style={{
        width: '100%',
        padding: getSpacingStyle(padding, '0px'),
        margin: getSpacingStyle(dividerOptions.margin, '0px'),
        display: 'flex',
        justifyContent:
          alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center',
        boxSizing: 'border-box'
      }}
    >
      <hr
        style={{
          width: `${width}%`,
          border: 'none',
          borderTop: `${thickness}px ${style} ${color}`,
          height: 0,
          margin: 0
        }}
      />
    </div>
  );
};

export default DividerFieldComponent;