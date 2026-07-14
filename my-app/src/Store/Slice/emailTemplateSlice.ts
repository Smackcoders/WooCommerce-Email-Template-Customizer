import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EmailTemplate, EmailTemplateType } from '../../types/emailTemplate';

interface EmailTemplateState {
    templates: EmailTemplate[];
    currentTemplateType: EmailTemplateType | null;
    isLoading: boolean;
}

const initialState: EmailTemplateState = {
    templates: [], // Initialize with empty array - templates will be loaded from database
    currentTemplateType: null,
    isLoading: false,
};

const emailTemplateSlice = createSlice({
    name: 'emailTemplate',
    initialState,
    reducers: {
        // Load a template into workspace by type
        loadTemplateByType: (state, action: PayloadAction<EmailTemplateType>) => {
            state.currentTemplateType = action.payload;
        },

        // Update template content (when editing in workspace)
        updateTemplateContent: (state, action: PayloadAction<{
            type: EmailTemplateType;
            content: any;
        }>) => {
            const template = state.templates.find(t => t.type === action.payload.type);
            if (template) {
                template.content = action.payload.content;
                template.updatedAt = new Date().toISOString();
            }
        },

        // Update template subject
        updateTemplateSubject: (state, action: PayloadAction<{
            type: EmailTemplateType;
            subject: string;
        }>) => {
            const template = state.templates.find(t => t.type === action.payload.type);
            if (template) {
                template.subject = action.payload.subject;
                template.updatedAt = new Date().toISOString();
            }
        },

        // Save template as draft
        saveTemplateAsDraft: (state, action: PayloadAction<EmailTemplateType>) => {
            const template = state.templates.find(t => t.type === action.payload);
            if (template) {
                template.status = 'draft';
                template.updatedAt = new Date().toISOString();
            }
        },

        // Publish template
        publishTemplate: (state, action: PayloadAction<EmailTemplateType>) => {
            const template = state.templates.find(t => t.type === action.payload);
            if (template) {
                template.status = 'published';
                template.updatedAt = new Date().toISOString();
            }
        },

        // Clear current template
        clearCurrentTemplate: (state) => {
            state.currentTemplateType = null;
        },
    },
});

export const {
    loadTemplateByType,
    updateTemplateContent,
    updateTemplateSubject,
    saveTemplateAsDraft,
    publishTemplate,
    clearCurrentTemplate,
} = emailTemplateSlice.actions;

export default emailTemplateSlice.reducer;
