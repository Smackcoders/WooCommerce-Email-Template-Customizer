import React, { useState } from 'react';
import { TextField, MenuItem, Typography, IconButton, Menu } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';

export const PLACEHOLDERS = [
    // Site
    { label: 'Site Name', value: '{{site_name}}' },
    { label: 'Site Title', value: '{{site_title}}' },
    { label: 'Site URL', value: '{{site_url}}' },
    { label: 'Store Name', value: '{{store_name}}' },
    { label: 'Store Email', value: '{{store_email}}' },
    { label: 'Store Phone', value: '{{store_phone}}' },
    { label: 'Shop URL', value: '{{shop_url}}' },
    { label: 'Home URL', value: '{{home_url}}' },
    { label: 'Admin Email', value: '{{admin_email}}' },

    // Order
    { label: 'Order ID', value: '{{order_id}}' },
    { label: 'Order Number', value: '{{order_number}}' },
    { label: 'Order Date', value: '{{order_date}}' },
    { label: 'Order Date Time', value: '{{order_date_time}}' },
    { label: 'Order Total', value: '{{order_total}}' },
    { label: 'Order Subtotal', value: '{{order_subtotal}}' },
    { label: 'Order Discount', value: '{{order_discount}}' },
    { label: 'Order Shipping', value: '{{order_shipping}}' },
    { label: 'Order Tax', value: '{{order_tax}}' },
    { label: 'Payment Method', value: '{{payment_method}}' },
    { label: 'Payment URL', value: '{{payment_url}}' },
    { label: 'Transaction ID', value: '{{transaction_id}}' },
    { label: 'Currency', value: '{{currency}}' },
    { label: 'Order Status', value: '{{order_status}}' },
    { label: 'Order Notes', value: '{{order_notes}}' },
    { label: 'Order Note', value: '{{order_note}}' },
    { label: 'Order Received URL', value: '{{order_received_url}}' },
    { label: 'Admin Order URL', value: '{{admin_order_url}}' },
    { label: 'Checkout URL', value: '{{checkout_url}}' },
    { label: 'My Account URL', value: '{{my_account_url}}' },

    // Order Refund
    { label: 'Refund Amount', value: '{{refund_amount}}' },
    { label: 'Refund Reason', value: '{{refund_reason}}' },
    { label: 'Refund ID', value: '{{refund_id}}' },
    { label: 'Order Fully Refunded', value: '{{order_fully_refund}}' },
    { label: 'Order Partial Refunded', value: '{{order_partial_refund}}' },

    // Customer
    { label: 'Customer Name', value: '{{customer_name}}' },
    { label: 'First Name', value: '{{first_name}}' },
    { label: 'Last Name', value: '{{last_name}}' },
    { label: 'Customer First Name', value: '{{customer_first_name}}' },
    { label: 'Customer Last Name', value: '{{customer_last_name}}' },
    { label: 'Customer Email', value: '{{customer_email}}' },
    { label: 'Customer User Name', value: '{{customer_user_name}}' },
    { label: 'Customer ID', value: '{{customer_id}}' },
    { label: 'User Login', value: '{{user_login}}' },
    { label: 'User Email', value: '{{user_email}}' },
    { label: 'User Password', value: '{{user_password}}' },
    { label: 'Customer Note', value: '{{customer_note}}' },

    // Billing
    { label: 'Billing Name', value: '{{billing_name}}' },
    { label: 'Billing First Name', value: '{{billing_first_name}}' },
    { label: 'Billing Last Name', value: '{{billing_last_name}}' },
    { label: 'Billing Company', value: '{{billing_company}}' },
    { label: 'Billing Address 1', value: '{{billing_address_1}}' },
    { label: 'Billing Address 2', value: '{{billing_address_2}}' },
    { label: 'Billing City', value: '{{billing_city}}' },
    { label: 'Billing Postcode', value: '{{billing_postcode}}' },
    { label: 'Billing Country', value: '{{billing_country}}' },
    { label: 'Billing State', value: '{{billing_state}}' },
    { label: 'Billing Email', value: '{{billing_email}}' },
    { label: 'Billing Phone', value: '{{billing_phone}}' },

    // Shipping
    { label: 'Shipping Method', value: '{{shipping_method}}' },
    { label: 'Shipping Name', value: '{{shipping_name}}' },
    { label: 'Shipping First Name', value: '{{shipping_first_name}}' },
    { label: 'Shipping Last Name', value: '{{shipping_last_name}}' },
    { label: 'Shipping Company', value: '{{shipping_company}}' },
    { label: 'Shipping Address 1', value: '{{shipping_address_1}}' },
    { label: 'Shipping Address 2', value: '{{shipping_address_2}}' },
    { label: 'Shipping City', value: '{{shipping_city}}' },
    { label: 'Shipping Postcode', value: '{{shipping_postcode}}' },
    { label: 'Shipping Country', value: '{{shipping_country}}' },
    { label: 'Shipping State', value: '{{shipping_state}}' },
    { label: 'Shipping Email', value: '{{shipping_email}}' },
    { label: 'Shipping Phone', value: '{{shipping_phone}}' },

    // User / Auth
    { label: 'Reset Link', value: '{{reset_link}}' },
    { label: 'Login URL', value: '{{login_url}}' },
    { label: 'Set Password URL', value: '{{set_password_url}}' },
    { label: 'Reset Password URL', value: '{{reset_password_url}}' },

    // Misc
    { label: 'Current Year', value: '{{current_year}}' },
    { label: 'Email Subject', value: '{{email_subject}}' },
    { label: 'Email Heading', value: '{{email_heading}}' },
    { label: 'From Email', value: '{{from_email}}' },
    { label: 'Coupon Expire Date', value: '{{coupon_expire_date}}' },
    { label: 'Dokan Activation Link', value: '{{dokan_activation_link}}' },
];

interface PlaceholderSelectProps {
    onSelect: (placeholder: string) => void;
    label?: string;
    placeholder?: string;
    size?: 'small' | 'medium';
    iconOnly?: boolean;
}

export const PlaceholderSelect: React.FC<PlaceholderSelectProps> = ({
    onSelect,
    label,
    placeholder = "Dynamic Data",
    size = "small",
    iconOnly = false
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (value) {
            onSelect(value);
        }
    };

    if (iconOnly) {
        return (
            <>
                <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: '#888', p: 0.5 }}>
                    <StorageIcon sx={{ fontSize: '16px' }} />
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    disablePortal
                    sx={{ zIndex: 1300001 }}
                    PaperProps={{
                        style: {
                            maxHeight: 300,
                            maxWidth: 240,
                            width: 240,
                        }
                    }}
                >
                    {PLACEHOLDERS.map((ph) => (
                        <MenuItem 
                            key={ph.value} 
                            onClick={() => {
                                onSelect(ph.value);
                                setAnchorEl(null);
                            }}
                            sx={{ whiteSpace: 'normal' }}
                        >
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {ph.value}
                            </Typography>
                        </MenuItem>
                    ))}
                </Menu>
            </>
        );
    }

    return (
        <TextField
            select
            fullWidth
            size={size}
            label={label}
            value=""
            onChange={handleChange}
            InputLabelProps={{
                shrink: true,
                sx: { fontSize: '13px', fontWeight: 600, color: '#555' }
            }}
            sx={{
                "& .MuiOutlinedInput-root": {
                    fontSize: '11px',
                    bgcolor: '#f9f9f9',
                    "& fieldset": { borderColor: "#e7e9eb" },
                    "&:hover fieldset": { borderColor: "#d5dadf" },
                    "&.Mui-focused fieldset": { borderColor: "#93003c" },
                },
                "& .MuiInputBase-input": { padding: "8px 12px" },
            }}
            SelectProps={{
                displayEmpty: true,
                renderValue: (value: any) => {
                    if (value === "") {
                        return <span style={{ color: "rgba(0, 0, 0, 0.6)", fontSize: '11px' }}>{placeholder}</span>;
                    }
                    return <span style={{ fontSize: '11px' }}>{value}</span>;
                },
                MenuProps: {
                    disablePortal: true,
                    anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left"
                    },
                    transformOrigin: {
                        vertical: "top",
                        horizontal: "left"
                    },
                    PaperProps: {
                        style: {
                            maxHeight: 300,
                            maxWidth: 240,
                            width: 240,
                        }
                    },
                    sx: { zIndex: 1300001 }
                }
            }}
        >
            <MenuItem value="" disabled>
                {placeholder}
            </MenuItem>
            {PLACEHOLDERS.map((ph) => (
                <MenuItem key={ph.value} value={ph.value} sx={{ whiteSpace: 'normal' }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {ph.value}
                    </Typography>
                </MenuItem>
            ))}
        </TextField>
    );
};

