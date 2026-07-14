import React from 'react';
import { Box, Typography, Link } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../Store/store';
import { setSelectedBlockId, setBlocks, defaultEmailFooterEditorOptions } from '../../../Store/Slice/workspaceSlice';
import { getSubElementSx, replaceDynamicVariables } from '../../utils/treeHelper';
import SubElementWrapper from '../../WorkspaceColumn/workspaceArea/SubElementWrapper';
import { useDrag, useDrop } from 'react-dnd';
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import PinterestIcon from "@mui/icons-material/Pinterest";
import YouTubeIcon from "@mui/icons-material/YouTube";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import RedditIcon from "@mui/icons-material/Reddit";
import MailIcon from "@mui/icons-material/Mail";
import GitHubIcon from "@mui/icons-material/GitHub";
import TelegramIcon from "@mui/icons-material/Telegram";

const getSpacingStyle = (spacing: any, defaultVal: string = '0px') => {
  if (!spacing) return defaultVal;
  if (typeof spacing === 'string') return spacing;
  return `${spacing.top || 0}px ${spacing.right || 0}px ${spacing.bottom || 0}px ${spacing.left || 0}px`;
};



const socialIconsMap: any = {
    facebook: { icon: <FacebookIcon />, fallback: "f", color: "#3b5998" },
    twitter: { icon: <TwitterIcon />, fallback: "x", color: "#1DA1F2" },
    linkedin: { icon: <LinkedInIcon />, fallback: "l", color: "#0077B5" },
    instagram: { icon: <InstagramIcon />, fallback: "i", color: "#E1306C" },
    pinterest: { icon: <PinterestIcon />, fallback: "p", color: "#Bd081C" },
    youtube: { icon: <YouTubeIcon />, fallback: "y", color: "#FF0000" },
    whatsapp: { icon: <WhatsAppIcon />, fallback: "w", color: "#25D366" },
    reddit: { icon: <RedditIcon />, fallback: "r", color: "#FF4500" },
    github: { icon: <GitHubIcon />, fallback: "g", color: "#181717" },
    telegram: { icon: <TelegramIcon />, fallback: "t", color: "#0088CC" },
    envelope: { icon: <MailIcon />, fallback: "e", color: "#0072C6" },
};

type FooterSectionKey = 'social' | 'address' | 'contact' | 'legal' | 'copyright';

interface FooterSectionDragItem {
    type: 'EMAIL_FOOTER_SECTION';
    section: FooterSectionKey;
    index: number;
    footerId: string;
}

interface DraggableFooterSectionProps {
    section: FooterSectionKey;
    order: number;
    footerId: string;
    previewMode: boolean;
    children: React.ReactNode;
    onMove: (dragSection: FooterSectionKey, hoverSection: FooterSectionKey) => void;
}

const DraggableFooterSection: React.FC<DraggableFooterSectionProps> = ({
    section,
    order,
    footerId,
    previewMode,
    children,
    onMove,
}) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const setFooterSectionDragActive = (active: boolean) => {
        (window as any).__woomailerFooterSectionDragActive = active;
    };

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'EMAIL_FOOTER_SECTION',
        item: { type: 'EMAIL_FOOTER_SECTION', section, index: order, footerId },
        canDrag: !previewMode,
        end: () => {
            setFooterSectionDragActive(false);
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [section, order, footerId, previewMode]);

    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'EMAIL_FOOTER_SECTION',
        hover: (item: FooterSectionDragItem) => {
            if (!ref.current || previewMode) return;
            if (item.footerId !== footerId || item.section === section) return;
            if (item.index === order) return;

            onMove(item.section, section);
            item.index = order;
        },
        collect: (monitor) => ({
            isOver: monitor.isOver({ shallow: true }),
        }),
    }), [section, order, footerId, previewMode, onMove]);

    drag(drop(ref));

    return (
        <Box
            ref={ref}
            onMouseDownCapture={(e) => {
                if (previewMode) return;
                setFooterSectionDragActive(true);
                e.stopPropagation();
            }}
            onMouseUpCapture={() => setFooterSectionDragActive(false)}
            onMouseLeave={() => {
                if (!isDragging) setFooterSectionDragActive(false);
            }}
            sx={{
                order,
                width: '100%',
                position: 'relative',
                opacity: isDragging ? 0.45 : 1,
                cursor: previewMode ? 'inherit' : 'grab',
                outline: !previewMode && isOver ? '2px solid #2196f3' : 'none',
                outlineOffset: '2px',
                transition: 'opacity 0.15s ease, outline 0.15s ease',
            }}
        >
            {children}
        </Box>
    );
};

interface EmailFooterFieldComponentProps {
    blockId: string;
    columnIndex: number;
    isSelected: boolean;
    onClick: () => void;
    onWidgetClick: (e: React.MouseEvent) => void;
    widgetIndex: number;
    previewMode?: boolean;
    widgetData?: any;
}

const EmailFooterFieldComponent: React.FC<EmailFooterFieldComponentProps> = ({
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
    const blocks = useSelector((state: RootState) => state.workspace.blocks);
    const block = useSelector((state: RootState) => state.workspace.blocks.find(b => b.id === blockId));
    const column = block?.columns[columnIndex];

    const options = React.useMemo(() => {
        if (widgetData && widgetData.contentData) {
            try {
                return { ...defaultEmailFooterEditorOptions, ...JSON.parse(widgetData.contentData) };
            } catch (e) {
                console.error("Failed to parse footer options", e);
            }
        }

        const contentData = column?.widgetContents?.[widgetIndex]?.contentData;
        if (contentData) {
            try {
                return { ...defaultEmailFooterEditorOptions, ...JSON.parse(contentData) };
            } catch (e) {
                console.error("Failed to parse footer options", e);
            }
        }
        return defaultEmailFooterEditorOptions;
    }, [column, widgetIndex, widgetData]);

    const emailFooterEditorOptions = options;
    const currentYear = new Date().getFullYear();
    const defaultFooterOrder: FooterSectionKey[] = ['social', 'address', 'contact', 'legal', 'copyright'];
    const footerOrder = Array.isArray(emailFooterEditorOptions.footerOrder)
        ? [
            ...emailFooterEditorOptions.footerOrder.filter((section: string): section is FooterSectionKey => defaultFooterOrder.includes(section as FooterSectionKey)),
            ...defaultFooterOrder.filter(section => !emailFooterEditorOptions.footerOrder.includes(section)),
        ]
        : defaultFooterOrder;
    const getFooterSectionOrder = (section: string) => footerOrder.indexOf(section);
    const footerDragId = `${blockId}:${columnIndex}:${widgetIndex}`;

    const moveFooterSection = React.useCallback((dragSection: FooterSectionKey, hoverSection: FooterSectionKey) => {
        const nextOrder = [...footerOrder];
        const dragIndex = nextOrder.indexOf(dragSection);
        const hoverIndex = nextOrder.indexOf(hoverSection);
        if (dragIndex === -1 || hoverIndex === -1 || dragIndex === hoverIndex) return;

        nextOrder.splice(dragIndex, 1);
        nextOrder.splice(hoverIndex, 0, dragSection);

        const nextBlocks = JSON.parse(JSON.stringify(blocks));
        const nextBlock = nextBlocks.find((b: any) => b.id === blockId);
        const nextColumn = nextBlock?.columns?.[columnIndex];
        const nextWidget = nextColumn?.widgetContents?.[widgetIndex];
        if (!nextWidget || nextWidget.contentType !== 'emailFooter') return;

        let nextData: any = {};
        try {
            nextData = JSON.parse(nextWidget.contentData || '{}');
        } catch (err) {
            nextData = {};
        }

        nextData.footerOrder = nextOrder;
        nextWidget.contentData = JSON.stringify(nextData);
        dispatch(setBlocks(nextBlocks));
    }, [blockId, blocks, columnIndex, dispatch, footerOrder, widgetIndex]);

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
                backgroundColor: emailFooterEditorOptions?.backgroundColor || '#333333',
                color: emailFooterEditorOptions?.textColor || '#ffffff',
                padding: getSpacingStyle(emailFooterEditorOptions?.padding, '0px'),
                margin: getSpacingStyle(emailFooterEditorOptions?.margin, '0px'),
                textAlign: (emailFooterEditorOptions?.textAlign as any) || 'center',
                border: isSelected ? '2px dashed blue' : 'none',
                cursor: 'pointer',
                fontFamily: emailFooterEditorOptions?.fontFamily === 'inherit' || !emailFooterEditorOptions?.fontFamily ? 'inherit' : emailFooterEditorOptions?.fontFamily,
                fontSize: emailFooterEditorOptions?.fontSize || '14px',
                ...getSubElementSx(emailFooterEditorOptions?.subStyles, 'outer_container')
            }}
        >
            <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="emailFooter" subElementId="footer_container" previewMode={previewMode}>
                <Box sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    ...getSubElementSx(emailFooterEditorOptions?.subStyles, 'footer_container')
                }}>
                    {/* Social Media Icons */}
                    {emailFooterEditorOptions?.showSocialMedia !== false && (
                        <DraggableFooterSection section="social" order={getFooterSectionOrder('social')} footerId={footerDragId} previewMode={previewMode} onMove={moveFooterSection}>
                        <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="emailFooter" subElementId="footer_social" previewMode={previewMode}>
                            <Box sx={{
                                position: 'relative',
                                marginBottom: '15px',
                                display: 'flex',
                                justifyContent: (emailFooterEditorOptions?.textAlign === 'left' ? 'flex-start' :
                                    emailFooterEditorOptions?.textAlign === 'right' ? 'flex-end' :
                                        'center'),
                                gap: '10px',
                                ...getSubElementSx(emailFooterEditorOptions?.subStyles, 'footer_social')
                            }}>
                                {(() => {
                                    const safeIcons = Array.isArray(emailFooterEditorOptions?.socialIcons?.icons) ? emailFooterEditorOptions.socialIcons.icons : [];
                                    const safeUrls = Array.isArray(emailFooterEditorOptions?.socialIcons?.urls) ? emailFooterEditorOptions.socialIcons.urls : [];
                                    return safeIcons.map((key: string, index: number) => {
                                        const iconData = socialIconsMap[key];
                                        if (!iconData) return null;
                                        const url = safeUrls[index] || '#';
                                        return (
                                            <a href={url} key={key} target="_blank" rel="noopener noreferrer" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} style={{ textDecoration: 'none' }}>
                                                {React.cloneElement(iconData.icon, {
                                                    sx: {
                                                        width: 32,
                                                        height: 32,
                                                        color: iconData.color,
                                                        display: 'block'
                                                    }
                                                })}
                                            </a>
                                        );
                                    });
                                })()}
                            </Box>
                        </SubElementWrapper>
                        </DraggableFooterSection>
                    )}

                    {/* Store Address */}
                    {emailFooterEditorOptions?.showAddress !== false && (
                        <DraggableFooterSection section="address" order={getFooterSectionOrder('address')} footerId={footerDragId} previewMode={previewMode} onMove={moveFooterSection}>
                        <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="emailFooter" subElementId="footer_address" previewMode={previewMode}>
                            <Typography variant="body2" sx={{ position: 'relative', marginBottom: '10px', fontSize: 'inherit', fontFamily: 'inherit', color: 'inherit', ...getSubElementSx(emailFooterEditorOptions?.subStyles, 'footer_address') }}>
                                {replaceDynamicVariables(emailFooterEditorOptions?.storeAddress || '{{store_address}}')}
                            </Typography>
                        </SubElementWrapper>
                        </DraggableFooterSection>
                    )}

                    {/* Contact Info */}
                    {emailFooterEditorOptions?.showContact !== false && (
                        <DraggableFooterSection section="contact" order={getFooterSectionOrder('contact')} footerId={footerDragId} previewMode={previewMode} onMove={moveFooterSection}>
                        <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="emailFooter" subElementId="footer_contact" previewMode={previewMode}>
                            <Typography variant="body2" sx={{ position: 'relative', marginBottom: '10px', fontSize: 'inherit', fontFamily: 'inherit', color: 'inherit', ...getSubElementSx(emailFooterEditorOptions?.subStyles, 'footer_contact') }}>
                                <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="emailFooter" subElementId="footer_email_label" previewMode={previewMode}>
                                    <span style={getSubElementSx(emailFooterEditorOptions?.subStyles, 'footer_email_label') as any}>{emailFooterEditorOptions?.emailLabel || 'Email:'}</span>
                                </SubElementWrapper>{' '}
                                <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="emailFooter" subElementId="footer_email_value" previewMode={previewMode}>
                                    <span style={getSubElementSx(emailFooterEditorOptions?.subStyles, 'footer_email_value') as any}>{replaceDynamicVariables(emailFooterEditorOptions?.contactEmail || '{{store_email}}')}</span>
                                </SubElementWrapper>
                                {' | '}
                                <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="emailFooter" subElementId="footer_phone_label" previewMode={previewMode}>
                                    <span style={getSubElementSx(emailFooterEditorOptions?.subStyles, 'footer_phone_label') as any}>{emailFooterEditorOptions?.phoneLabel || 'Phone:'}</span>
                                </SubElementWrapper>{' '}
                                <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="emailFooter" subElementId="footer_phone_value" previewMode={previewMode}>
                                    <span style={getSubElementSx(emailFooterEditorOptions?.subStyles, 'footer_phone_value') as any}>{replaceDynamicVariables(emailFooterEditorOptions?.contactPhone || '0000-0000-0000')}</span>
                                </SubElementWrapper>
                            </Typography>
                        </SubElementWrapper>
                        </DraggableFooterSection>
                    )}

                    {/* Legal Section: Links */}
                    {emailFooterEditorOptions?.showLegal !== false && (
                        <DraggableFooterSection section="legal" order={getFooterSectionOrder('legal')} footerId={footerDragId} previewMode={previewMode} onMove={moveFooterSection}>
                        <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="emailFooter" subElementId="footer_legal" previewMode={previewMode}>
                            <Box sx={{ position: 'relative', marginBottom: '10px', ...getSubElementSx(emailFooterEditorOptions?.subStyles, 'footer_legal') }}>
                                {emailFooterEditorOptions?.privacyLinkUrl && (
                                    <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="emailFooter" subElementId="footer_privacy_link" previewMode={previewMode}>
                                        <Link 
                                            href={replaceDynamicVariables(emailFooterEditorOptions.privacyLinkUrl)} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            onClick={(e) => { 
                                                if (!previewMode && (!emailFooterEditorOptions.privacyLinkUrl || emailFooterEditorOptions.privacyLinkUrl === '#')) {
                                                    e.preventDefault(); 
                                                }
                                            }}
                                            sx={{ color: emailFooterEditorOptions?.linkColor || '#4CAF50', marginX: '10px', fontSize: 'inherit', fontFamily: 'inherit', ...getSubElementSx(emailFooterEditorOptions?.subStyles, 'footer_privacy_link') }}
                                        >
                                            {replaceDynamicVariables(emailFooterEditorOptions.privacyLinkText || 'Privacy Policy')}
                                        </Link>
                                    </SubElementWrapper>
                                )}
                                {emailFooterEditorOptions?.termsLinkUrl && (
                                    <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="emailFooter" subElementId="footer_terms_link" previewMode={previewMode}>
                                        <Link 
                                            href={replaceDynamicVariables(emailFooterEditorOptions.termsLinkUrl)} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            onClick={(e) => { 
                                                if (!previewMode && (!emailFooterEditorOptions.termsLinkUrl || emailFooterEditorOptions.termsLinkUrl === '#')) {
                                                    e.preventDefault(); 
                                                }
                                            }}
                                            sx={{ color: emailFooterEditorOptions?.linkColor || '#4CAF50', marginX: '10px', fontSize: 'inherit', fontFamily: 'inherit', ...getSubElementSx(emailFooterEditorOptions?.subStyles, 'footer_terms_link') }}
                                        >
                                            {replaceDynamicVariables(emailFooterEditorOptions.termsLinkText || 'Terms & Conditions')}
                                        </Link>
                                    </SubElementWrapper>
                                )}
                            </Box>
                        </SubElementWrapper>
                        </DraggableFooterSection>
                    )}

                    {/* Copyright Section */}
                    {emailFooterEditorOptions?.showCopyright !== false && (
                        <DraggableFooterSection section="copyright" order={getFooterSectionOrder('copyright')} footerId={footerDragId} previewMode={previewMode} onMove={moveFooterSection}>
                        <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="emailFooter" subElementId="footer_copyright" previewMode={previewMode}>
                            <Box sx={{ position: 'relative' }}>
                                <Typography variant="body2" sx={{ fontSize: 'inherit', fontFamily: 'inherit', color: 'inherit', opacity: 0.8, ...getSubElementSx(emailFooterEditorOptions?.subStyles, 'footer_copyright') }}
                                dangerouslySetInnerHTML={{
                                    __html: replaceDynamicVariables(
                                        emailFooterEditorOptions?.copyrightText
                                            ? emailFooterEditorOptions.copyrightText
                                                .replace('{{year}}', currentYear.toString())
                                                .replace('{{current_year}}', currentYear.toString())
                                            : `© ${currentYear} ${emailFooterEditorOptions?.storeName || '{{store_name}}'}. All rights reserved.`
                                    )
                                }}
                                />
                            </Box>
                        </SubElementWrapper>
                        </DraggableFooterSection>
                    )}
                </Box>
            </SubElementWrapper>
        </Box>
    );
};

export default EmailFooterFieldComponent;
