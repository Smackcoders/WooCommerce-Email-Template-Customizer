export type EmailTemplateType =
    | 'new_order_admin'
    | 'cancelled_order_customer'
    | 'cancelled_order_admin'
    | 'failed_order_customer'
    | 'failed_order_admin'
    | 'processing_order_customer'
    | 'processing_order_admin'
    | 'completed_order_customer'
    | 'refunded_order_customer'
    | 'refunded_order_customer_full'
    | 'refunded_order_customer_partial'
    | 'refunded_order_admin'
    | 'customer_invoice'
    | 'customer_invoice_paid'
    | 'customer_invoice_pending'
    | 'customer_note'
    | 'on_hold_order'
    | 'abandoned_cart'
    | 'new_user_registration'
    | 'new_user_registration_admin'
    | 'reset_password';

export interface EmailTemplate {
    id: string;
    name: string;
    type: EmailTemplateType;
    description: string;
    subject: string;
    content: any; // Workspace blocks data
    placeholders: string[]; // Available placeholders for this template
    status: 'draft' | 'published';
    createdAt: string;
    updatedAt: string;
}

export interface EmailTypeInfo {
    type: EmailTemplateType;
    name: string;
    description: string;
    icon: string;
    category: 'admin' | 'customer';
    defaultPlaceholders: string[];
}
