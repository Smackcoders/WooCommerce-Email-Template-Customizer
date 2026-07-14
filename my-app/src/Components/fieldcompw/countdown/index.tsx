import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedBlockId } from '../../../Store/Slice/workspaceSlice';
import { RootState } from '../../../Store/store';

import { getSpacingStyle } from '../../utils/treeHelper';

interface CountdownFieldComponentProps {
  blockId: string;
  columnIndex: number;
  isSelected: boolean;
  onClick: () => void;
  onWidgetClick: (e: React.MouseEvent) => void;
  widgetIndex: number;
  widgetData?: any;
}

const CountdownFieldComponent: React.FC<CountdownFieldComponentProps> = ({
  blockId,
  columnIndex,
  isSelected,
  onClick,
  onWidgetClick,
  widgetIndex,
  widgetData
}) => {
  const dispatch = useDispatch();
  const { countdownEditorOptions } = useSelector((state: RootState) => state.workspace);

  const storeWidgetContent = useSelector((state: RootState) =>
    state.workspace.blocks.find((block) => block.id === blockId)?.columns[columnIndex]?.widgetContents[widgetIndex] || null
  );

  const widgetContent = widgetData || storeWidgetContent;
  const options = widgetContent?.contentData
    ? { ...countdownEditorOptions, ...JSON.parse(widgetContent.contentData) }
    : countdownEditorOptions;

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = options.targetDate
        ? new Date(options.targetDate)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds, expired: false };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [options.targetDate]);

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
        border: '1px solid transparent',
        borderRadius: '8px',
        padding: getSpacingStyle(options.padding, '0px'),
        margin: getSpacingStyle(options.margin, '0px'),
        backgroundColor: options.containerBgColor || 'transparent',
        fontFamily: (options as any).fontFamily || 'inherit',
        position: 'relative',
        textAlign: 'center',
        '&:hover': {
          border: '1px dashed #ccc',
        }
      }}
    >
      {options.title && (
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            fontWeight: 900,
            color: options.titleColor || '#000',
            textTransform: 'none',
            letterSpacing: '1px',
            fontSize: '2.5rem'
          }}
        >
          {options.title}
        </Typography>
      )}

      {timeLeft.expired ? (
        <Typography variant="h5" sx={{ color: '#dc3545', fontWeight: 'bold' }}>
          {options.endMessage || 'The offer has ended!'}
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap', mb: 4 }}>
          {[
            { value: timeLeft.days, label: options.daysLabel || 'Days', show: options.showDays !== false },
            { value: timeLeft.hours, label: options.hoursLabel || 'Hours', show: options.showHours !== false },
            { value: timeLeft.minutes, label: options.minutesLabel || 'Minutes', show: options.showMinutes !== false },
            { value: timeLeft.seconds, label: options.secondsLabel || 'Seconds', show: options.showSeconds !== false }
          ].filter(item => item.show).map((item, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: options.labelColor || '#333',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                {item.label}
              </Typography>
              <Box
                sx={{
                  backgroundColor: options.backgroundColor || '#d32f2f',
                  borderRadius: (options as any).borderRadius !== undefined ? `${(options as any).borderRadius}px` : '15px',
                  width: '90px',
                  height: '90px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 'bold',
                    color: options.textColor || '#fff',
                    fontSize: '2.5rem'
                  }}
                >
                  {item.value.toString().padStart(2, '0')}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {options.footer && (
        <Typography
          variant="h5"
          sx={{
            mt: 2,
            fontWeight: 'bold',
            color: options.footerColor || '#000',
            fontSize: '1.8rem'
          }}
        >
          {options.footer}
        </Typography>
      )}
    </Box>
  );
};

export default CountdownFieldComponent;