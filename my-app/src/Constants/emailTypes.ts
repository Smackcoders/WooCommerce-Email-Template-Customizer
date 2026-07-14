import { EmailTypeInfo, EmailTemplateType } from '../types/emailTemplate';

export const EMAIL_TYPES: EmailTypeInfo[] = [
    // === Admin ===
    {
        type: 'cancelled_order_admin',
        name: 'Cancelled order (Admin)',
        description: 'Sent to admin when an order is cancelled',
        icon: '❌',
        category: 'admin',
        defaultPlaceholders: ['{order_number}', '{order_date}', '{customer_name}', '{order_total}']
    },
    {
        type: 'failed_order_admin',
        name: 'Failed order (Admin)',
        description: 'Sent to admin when payment fails',
        icon: '⚠️',
        category: 'admin',
        defaultPlaceholders: ['{order_number}', '{order_date}', '{customer_name}', '{order_total}']
    },
    {
        type: 'new_order_admin',
        name: 'New order (Admin)',
        description: 'Sent to admin when a new order is received',
        icon: '📦',
        category: 'admin',
        defaultPlaceholders: ['{order_number}', '{order_date}', '{customer_name}', '{customer_email}', '{order_total}']
    },

    // === Customer ===
    {
        type: 'cancelled_order_customer',
        name: 'Cancelled order (Customer)',
        description: 'Sent to customer when an order is cancelled',
        icon: '❌',
        category: 'customer',
        defaultPlaceholders: ['{order_number}', '{order_date}', '{customer_name}', '{order_total}']
    },
    {
        type: 'completed_order_customer',
        name: 'Completed order (Customer)',
        description: 'Sent to customer when order is completed',
        icon: '✅',
        category: 'customer',
        defaultPlaceholders: ['{customer_name}', '{order_number}', '{order_date}', '{order_total}']
    },
    {
        type: 'customer_note',
        name: 'Customer note',
        description: 'Sent to customer when a note is added to their order',
        icon: '📝',
        category: 'customer',
        defaultPlaceholders: ['{customer_name}', '{order_number}', '{note_content}']
    },
    {
        type: 'failed_order_customer',
        name: 'Failed order (Customer)',
        description: 'Sent to customer when payment fails',
        icon: '⚠️',
        category: 'customer',
        defaultPlaceholders: ['{order_number}', '{order_date}', '{customer_name}', '{order_total}']
    },
    {
        type: 'new_user_registration',
        name: 'New account (Customer)',
        description: 'Sent to new customer upon registration',
        icon: '👤',
        category: 'customer',
        defaultPlaceholders: ['{customer_name}', '{user_login}', '{login_url}']
    },
    {
        type: 'customer_invoice_paid',
        name: 'Order details (Paid)',
        description: 'Sent to customer with order details after payment',
        icon: '📄',
        category: 'customer',
        defaultPlaceholders: ['{customer_name}', '{order_number}', '{order_total}', '{order_date}']
    },
    {
        type: 'customer_invoice_pending',
        name: 'Order details (Pending)',
        description: 'Sent to customer with order details for pending payment',
        icon: '📄',
        category: 'customer',
        defaultPlaceholders: ['{customer_name}', '{order_number}', '{order_total}', '{order_date}']
    },
    {
        type: 'on_hold_order',
        name: 'Order on-hold (Customer)',
        description: 'Sent to customer when order is on hold',
        icon: '⏸️',
        category: 'customer',
        defaultPlaceholders: ['{customer_name}', '{order_number}', '{order_date}']
    },
    {
        type: 'processing_order_customer',
        name: 'Processing order (Customer)',
        description: 'Sent to customer when order is processing',
        icon: '⏳',
        category: 'customer',
        defaultPlaceholders: ['{customer_name}', '{order_number}', '{order_date}', '{order_total}']
    },
    {
        type: 'refunded_order_customer_full',
        name: 'Refunded order (Full)',
        description: 'Sent to customer when order is fully refunded',
        icon: '💰',
        category: 'customer',
        defaultPlaceholders: ['{customer_name}', '{order_number}', '{refund_amount}', '{order_date}']
    },
    {
        type: 'refunded_order_customer_partial',
        name: 'Refunded order (Partial)',
        description: 'Sent to customer when order is partially refunded',
        icon: '💰',
        category: 'customer',
        defaultPlaceholders: ['{customer_name}', '{order_number}', '{refund_amount}', '{order_date}']
    },
    {
        type: 'reset_password',
        name: 'Reset password (Customer)',
        description: 'Sent to customer when they request a password reset',
        icon: '🔑',
        category: 'customer',
        defaultPlaceholders: ['{user_login}', '{reset_link}', '{store_name}']
    }
];

// Helper function to get email type info
export const getEmailTypeInfo = (type: EmailTemplateType): EmailTypeInfo | undefined => {
    return EMAIL_TYPES.find(et => et.type === type);
};

// Helper function to get placeholders for a type
export const getPlaceholdersForType = (type: EmailTemplateType): string[] => {
    const emailType = getEmailTypeInfo(type);
    return emailType?.defaultPlaceholders || [];
};
