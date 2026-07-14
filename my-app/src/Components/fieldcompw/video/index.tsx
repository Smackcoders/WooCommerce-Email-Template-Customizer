import React from 'react';
import { Box, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedBlockId } from '../../../Store/Slice/workspaceSlice';
import { RootState } from '../../../Store/store';

import { getSpacingStyle } from '../../utils/treeHelper';

interface VideoFieldComponentProps {
  blockId: string;
  columnIndex: number;
  isSelected: boolean;
  onClick: () => void;
  onWidgetClick: (e: React.MouseEvent) => void;
  widgetIndex: number;
  previewMode?: boolean;
  widgetData?: any;
}

const VideoFieldComponent: React.FC<VideoFieldComponentProps> = ({
  blockId,
  columnIndex,
  isSelected,
  onClick,
  onWidgetClick,
  widgetIndex,
  previewMode,
  widgetData
}) => {
  const dispatch = useDispatch();
  const { videoEditorOptions } = useSelector((state: RootState) => state.workspace);

  const storeWidgetContent = useSelector((state: RootState) =>
    state.workspace.blocks.find((block) => block.id === blockId)?.columns[columnIndex]?.widgetContents[widgetIndex] || null
  );

  const widgetContent = widgetData || storeWidgetContent;
  const options = widgetContent?.contentData
    ? { ...videoEditorOptions, ...JSON.parse(widgetContent.contentData) }
    : videoEditorOptions;

  const getVideoId = (url: string) => {
    // YouTube URL parsing
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getVideoId(options.url);

  return (
    <Box
      onClick={(e) => {
        e.stopPropagation();
        onWidgetClick(e);
        onClick();
        dispatch(setSelectedBlockId(blockId));
      }}
      sx={{
        width: options.width || '100%',
        border: '1px solid #ddd',
        borderRadius: '4px',
        overflow: 'hidden',
        backgroundColor: '#000',
        position: 'relative',
        padding: getSpacingStyle(options.padding, '0px'),
        margin: getSpacingStyle(options.margin, '0px'),
      }}
    >
      {videoId ? (
        <>
          <Box
            component="iframe"
            width="100%"
            height={options.height || '315px'}
            src={`https://www.youtube.com/embed/${videoId}${options.autoplay ? '?autoplay=1' : ''}${options.controls === false ? '&controls=0' : ''}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            sx={{
              display: 'block',
            }}
          />
          {/* Click Overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 10,
              cursor: 'pointer',
              backgroundColor: 'transparent',
              display: previewMode ? 'none' : 'block',
            }}
          />
        </>
      ) : (
        <Box
          sx={{
            width: '100%',
            height: options.height || '315px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#333',
            color: '#fff',
            flexDirection: 'column',
            padding: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>Video Preview</Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', mb: 2 }}>
            {options.url || 'No video URL provided'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#aaa' }}>
            Supports YouTube and Vimeo URLs
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default VideoFieldComponent;