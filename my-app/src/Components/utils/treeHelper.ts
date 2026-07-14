import { WidgetContentType } from '../../Store/Slice/workspaceSlice';
import store from '../../Store/store';

export interface TreeItem {
  id: string;
  name: string;
  type: 'block' | 'row_node' | 'column' | 'widget' | 'sub_element';
  blockId?: string;
  columnIndex?: number;
  rootWidgetIndex?: number;
  path?: Array<{ colIdx: number; childIdx: number }>;
  contentType?: WidgetContentType;
  subElementId?: string;
  headingType?: string;
  children?: TreeItem[];
}

export const getWooCommerceWidgetChildren = (
  widget: any,
  blockId: string,
  columnIndex: number,
  rootWidgetIndex: number,
  currentPath: any[]
): TreeItem[] => {
  const contentType = widget.contentType;
  const widgetId = widget.id || `outline_${blockId}_${columnIndex}_${rootWidgetIndex}_${currentPath.map((p: any) => p.childIdx).join('_')}`;

  const subId = (elemId: string) => `${widgetId}_sub_${elemId}`;

  const rawChildren: TreeItem[] = (() => {
    switch (contentType) {
      case 'billingAddress':
      case 'shippingAddress':
        return [
          // header_container directly under the widget (no outer_container wrapper)
          {
            id: subId('header_container'),
            name: 'CONTAINER',
            type: 'sub_element',
            subElementId: 'header_container',
            contentType,
            blockId,
            columnIndex,
            rootWidgetIndex,
            path: currentPath,
            children: [
              {
                id: subId('header_title'),
                name: 'HEADER',
                type: 'sub_element',
                subElementId: 'header_title',
                contentType,
                blockId,
                columnIndex,
                rootWidgetIndex,
                path: currentPath,
              }
            ]
          },
          {
            id: subId('fields_container'),
            name: 'CONTAINER',
            type: 'sub_element',
            subElementId: 'fields_container',
            contentType,
            blockId,
            columnIndex,
            rootWidgetIndex,
            path: currentPath,
            children: [
              // Name
              {
                id: subId('name_container'),
                name: 'CONTAINER',
                type: 'sub_element',
                subElementId: 'name_container',
                contentType,
                blockId,
                columnIndex,
                rootWidgetIndex,
                path: currentPath,
                children: [
                  {
                    id: subId('name_label'),
                    name: 'PARAGRAPH',
                    type: 'sub_element',
                    subElementId: 'name_label',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                  },
                  {
                    id: subId('name_value'),
                    name: 'PARAGRAPH',
                    type: 'sub_element',
                    subElementId: 'name_value',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                  }
                ]
              },
              // Phone
              {
                id: subId('phone_container'),
                name: 'CONTAINER',
                type: 'sub_element',
                subElementId: 'phone_container',
                contentType,
                blockId,
                columnIndex,
                rootWidgetIndex,
                path: currentPath,
                children: [
                  {
                    id: subId('phone_label'),
                    name: 'PARAGRAPH',
                    type: 'sub_element',
                    subElementId: 'phone_label',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                  },
                  {
                    id: subId('phone_value'),
                    name: 'PARAGRAPH',
                    type: 'sub_element',
                    subElementId: 'phone_value',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                  }
                ]
              },
              // Email
              {
                id: subId('email_container'),
                name: 'CONTAINER',
                type: 'sub_element',
                subElementId: 'email_container',
                contentType,
                blockId,
                columnIndex,
                rootWidgetIndex,
                path: currentPath,
                children: [
                  {
                    id: subId('email_label'),
                    name: 'PARAGRAPH',
                    type: 'sub_element',
                    subElementId: 'email_label',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                  },
                  {
                    id: subId('email_value'),
                    name: 'PARAGRAPH',
                    type: 'sub_element',
                    subElementId: 'email_value',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                  }
                ]
              },
              // Address Line 1
              {
                id: subId('address1_container'),
                name: 'CONTAINER',
                type: 'sub_element',
                subElementId: 'address1_container',
                contentType,
                blockId,
                columnIndex,
                rootWidgetIndex,
                path: currentPath,
                children: [
                  {
                    id: subId('address1_label'),
                    name: 'PARAGRAPH',
                    type: 'sub_element',
                    subElementId: 'address1_label',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                  },
                  {
                    id: subId('address1_value'),
                    name: 'PARAGRAPH',
                    type: 'sub_element',
                    subElementId: 'address1_value',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                  }
                ]
              },
              // Address Line 2
              {
                id: subId('address2_container'),
                name: 'CONTAINER',
                type: 'sub_element',
                subElementId: 'address2_container',
                contentType,
                blockId,
                columnIndex,
                rootWidgetIndex,
                path: currentPath,
                children: [
                  {
                    id: subId('address2_label'),
                    name: 'PARAGRAPH',
                    type: 'sub_element',
                    subElementId: 'address2_label',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                  },
                  {
                    id: subId('address2_value'),
                    name: 'PARAGRAPH',
                    type: 'sub_element',
                    subElementId: 'address2_value',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                  }
                ]
              },
              // City
              {
                id: subId('city_container'),
                name: 'CONTAINER',
                type: 'sub_element',
                subElementId: 'city_container',
                contentType,
                blockId,
                columnIndex,
                rootWidgetIndex,
                path: currentPath,
                children: [
                  {
                    id: subId('city_label'),
                    name: 'PARAGRAPH',
                    type: 'sub_element',
                    subElementId: 'city_label',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                  },
                  {
                    id: subId('city_value'),
                    name: 'PARAGRAPH',
                    type: 'sub_element',
                    subElementId: 'city_value',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                  }
                ]
              },
              // State
              {
                id: subId('state_container'),
                name: 'CONTAINER',
                type: 'sub_element',
                subElementId: 'state_container',
                contentType,
                blockId,
                columnIndex,
                rootWidgetIndex,
                path: currentPath,
                children: [
                  {
                    id: subId('state_label'),
                    name: 'PARAGRAPH',
                    type: 'sub_element',
                    subElementId: 'state_label',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                  },
                  {
                    id: subId('state_value'),
                    name: 'PARAGRAPH',
                    type: 'sub_element',
                    subElementId: 'state_value',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                  }
                ]
              },
              // Postal Code
              {
                id: subId('postalCode_container'),
                name: 'CONTAINER',
                type: 'sub_element',
                subElementId: 'postalCode_container',
                contentType,
                blockId,
                columnIndex,
                rootWidgetIndex,
                path: currentPath,
                children: [
                  {
                    id: subId('postalCode_label'),
                    name: 'PARAGRAPH',
                    type: 'sub_element',
                    subElementId: 'postalCode_label',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                  },
                  {
                    id: subId('postalCode_value'),
                    name: 'PARAGRAPH',
                    type: 'sub_element',
                    subElementId: 'postalCode_value',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                  }
                ]
              },
              // Country
              {
                id: subId('country_container'),
                name: 'CONTAINER',
                type: 'sub_element',
                subElementId: 'country_container',
                contentType,
                blockId,
                columnIndex,
                rootWidgetIndex,
                path: currentPath,
                children: [
                  {
                    id: subId('country_label'),
                    name: 'PARAGRAPH',
                    type: 'sub_element',
                    subElementId: 'country_label',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                  },
                  {
                    id: subId('country_value'),
                    name: 'PARAGRAPH',
                    type: 'sub_element',
                    subElementId: 'country_value',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                  }
                ]
              }
            ]
          }
        ];

      case 'orderItems':
        return [
          {
            id: subId('outer_container'),
            name: 'CONTAINER',
            type: 'sub_element',
            subElementId: 'outer_container',
            contentType,
            blockId,
            columnIndex,
            rootWidgetIndex,
            path: currentPath,
            children: [
              {
                id: subId('order_heading'),
                name: 'Order Heading',
                type: 'sub_element',
                subElementId: 'order_heading',
                contentType,
                blockId,
                columnIndex,
                rootWidgetIndex,
                path: currentPath,
              },
              {
                id: subId('table_container'),
                name: 'CONTAINER',
                type: 'sub_element',
                subElementId: 'table_container',
                contentType,
                blockId,
                columnIndex,
                rootWidgetIndex,
                path: currentPath,
                children: [
                  {
                    id: subId('header_row'),
                    name: 'CONTAINER',
                    type: 'sub_element',
                    subElementId: 'header_row',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                    children: [
                      {
                        id: subId('header_product'),
                        name: 'HEADER',
                        type: 'sub_element',
                        subElementId: 'header_product',
                        contentType,
                        blockId,
                        columnIndex,
                        rootWidgetIndex,
                        path: currentPath,
                      },
                      {
                        id: subId('header_quantity'),
                        name: 'HEADER',
                        type: 'sub_element',
                        subElementId: 'header_quantity',
                        contentType,
                        blockId,
                        columnIndex,
                        rootWidgetIndex,
                        path: currentPath,
                      },
                      {
                        id: subId('header_price'),
                        name: 'HEADER',
                        type: 'sub_element',
                        subElementId: 'header_price',
                        contentType,
                        blockId,
                        columnIndex,
                        rootWidgetIndex,
                        path: currentPath,
                      }
                    ]
                  },
                  {
                    id: subId('item_row'),
                    name: 'CONTAINER',
                    type: 'sub_element',
                    subElementId: 'item_row',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                    children: [
                      {
                        id: subId('item_product'),
                        name: 'PARAGRAPH',
                        type: 'sub_element',
                        subElementId: 'item_product',
                        contentType,
                        blockId,
                        columnIndex,
                        rootWidgetIndex,
                        path: currentPath,
                      },
                      {
                        id: subId('item_quantity'),
                        name: 'PARAGRAPH',
                        type: 'sub_element',
                        subElementId: 'item_quantity',
                        contentType,
                        blockId,
                        columnIndex,
                        rootWidgetIndex,
                        path: currentPath,
                      },
                      {
                        id: subId('item_price'),
                        name: 'PARAGRAPH',
                        type: 'sub_element',
                        subElementId: 'item_price',
                        contentType,
                        blockId,
                        columnIndex,
                        rootWidgetIndex,
                        path: currentPath,
                      }
                    ]
                  },
                  {
                    id: subId('subtotal_container'),
                    name: 'CONTAINER',
                    type: 'sub_element',
                    subElementId: 'subtotal_container',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                    children: [
                      {
                        id: subId('subtotal_label'),
                        name: 'Subtotal:',
                        type: 'sub_element',
                        subElementId: 'subtotal_label',
                        contentType,
                        blockId,
                        columnIndex,
                        rootWidgetIndex,
                        path: currentPath,
                      },
                      {
                        id: subId('subtotal_value'),
                        name: '{{order_subtotal}}',
                        type: 'sub_element',
                        subElementId: 'subtotal_value',
                        contentType,
                        blockId,
                        columnIndex,
                        rootWidgetIndex,
                        path: currentPath,
                      }
                    ]
                  },
                  {
                    id: subId('discount_container'),
                    name: 'CONTAINER',
                    type: 'sub_element',
                    subElementId: 'discount_container',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                    children: [
                      {
                        id: subId('discount_label'),
                        name: 'Discount:',
                        type: 'sub_element',
                        subElementId: 'discount_label',
                        contentType,
                        blockId,
                        columnIndex,
                        rootWidgetIndex,
                        path: currentPath,
                      },
                      {
                        id: subId('discount_value'),
                        name: '{{order_discount}}',
                        type: 'sub_element',
                        subElementId: 'discount_value',
                        contentType,
                        blockId,
                        columnIndex,
                        rootWidgetIndex,
                        path: currentPath,
                      }
                    ]
                  },
                  {
                    id: subId('payment_container'),
                    name: 'CONTAINER',
                    type: 'sub_element',
                    subElementId: 'payment_container',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                    children: [
                      {
                        id: subId('payment_label'),
                        name: 'Payment method:',
                        type: 'sub_element',
                        subElementId: 'payment_label',
                        contentType,
                        blockId,
                        columnIndex,
                        rootWidgetIndex,
                        path: currentPath,
                      },
                      {
                        id: subId('payment_value'),
                        name: '{{payment_method}}',
                        type: 'sub_element',
                        subElementId: 'payment_value',
                        contentType,
                        blockId,
                        columnIndex,
                        rootWidgetIndex,
                        path: currentPath,
                      }
                    ]
                  },
                  {
                    id: subId('total_container'),
                    name: 'CONTAINER',
                    type: 'sub_element',
                    subElementId: 'total_container',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                    children: [
                      {
                        id: subId('total_label'),
                        name: 'Total:',
                        type: 'sub_element',
                        subElementId: 'total_label',
                        contentType,
                        blockId,
                        columnIndex,
                        rootWidgetIndex,
                        path: currentPath,
                      },
                      {
                        id: subId('total_value'),
                        name: '{{order_total}}',
                        type: 'sub_element',
                        subElementId: 'total_value',
                        contentType,
                        blockId,
                        columnIndex,
                        rootWidgetIndex,
                        path: currentPath,
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ];

      case 'taxBilling':
        {
          const leaf = (id: string, name: string): TreeItem => ({
            id: subId(id),
            name,
            type: 'sub_element' as const,
            subElementId: id,
            contentType,
            blockId,
            columnIndex,
            rootWidgetIndex,
            path: currentPath,
          });
          const container = (id: string, children: TreeItem[] = []): TreeItem => ({
            id: subId(id),
            name: 'CONTAINER',
            type: 'sub_element' as const,
            subElementId: id,
            contentType,
            blockId,
            columnIndex,
            rootWidgetIndex,
            path: currentPath,
            children,
          });

          return [
            container('outer_container', [
              container('invoice_header_container', [
                leaf('invoice_title', 'HEADER'),
                container('order_date_container', [
                  leaf('order_date_label', 'Order Date:'),
                  leaf('order_date_value', '{{order_date}}'),
                ]),
              ]),
              container('totals_container', [
                container('subtotal_container', [
                  leaf('subtotal_label', 'Subtotal'),
                  leaf('subtotal_value', '{{order_subtotal}}'),
                ]),
                container('shipping_container', [
                  leaf('shipping_label', 'Shipping'),
                  leaf('shipping_value', '{{shipping_cost}}'),
                ]),
                container('discount_container', [
                  leaf('discount_label', 'Discount'),
                  leaf('discount_value', '{{order_discount}}'),
                ]),
                container('tax_container', [
                  leaf('tax_label', 'Tax'),
                  leaf('tax_value', '{{tax_amount}}'),
                ]),
                container('tax_rate_container', [
                  leaf('tax_rate_label', 'Tax Rate'),
                  leaf('tax_rate_value', '{{tax_rate}}'),
                ]),
                container('total_container', [
                  leaf('total_label', 'Total'),
                  leaf('total_value', '{{order_total}}'),
                ]),
              ]),
              container('billing_address_container', [
                leaf('billing_address_title', 'Billing Address:'),
                container('billing_name_container', [
                  leaf('billing_name_label', 'Name:'),
                  leaf('billing_name_value', '{{billing_first_name}} {{billing_last_name}}'),
                ]),
                container('billing_address_line_container', [
                  leaf('billing_address_label', 'Address:'),
                  leaf('billing_address_value', '{{billing_address_1}}'),
                ]),
                container('billing_location_container', [
                  leaf('billing_location_label', 'Location:'),
                  leaf('billing_location_value', '{{billing_city}}'),
                ]),
              ]),
              leaf('footer_text', 'Tax Billing'),
            ]),
          ];
        }

      case 'orderSubtotal':
        {
          const leaf = (id: string, name: string): TreeItem => ({
            id: subId(id),
            name,
            type: 'sub_element' as const,
            subElementId: id,
            contentType,
            blockId,
            columnIndex,
            rootWidgetIndex,
            path: currentPath,
          });
          const container = (id: string, children: TreeItem[] = []): TreeItem => ({
            id: subId(id),
            name: 'CONTAINER',
            type: 'sub_element' as const,
            subElementId: id,
            contentType,
            blockId,
            columnIndex,
            rootWidgetIndex,
            path: currentPath,
            children,
          });

          return [
            container('outer_container', [
              container('subtotal_container', [
                leaf('subtotal_label', 'Subtotal'),
                leaf('subtotal_value', '{{order_subtotal}}'),
              ]),
              container('discount_container', [
                leaf('discount_label', 'Discount'),
                leaf('discount_value', '{{order_discount}}'),
              ]),
              container('shipping_container', [
                leaf('shipping_label', 'Shipping'),
                leaf('shipping_value', '{{order_shipping}}'),
              ]),
              container('refunded_full_container', [
                leaf('refunded_full_label', 'Order fully refunded'),
                leaf('refunded_full_value', '{{order_total}}'),
              ]),
              container('refunded_partial_container', [
                leaf('refunded_partial_label', 'Refund'),
                leaf('refunded_partial_value', '{{refund_amount}}'),
              ]),
              container('row_container', [
                leaf('label_p', 'Label'),
                leaf('value_p', 'Value'),
              ]),
            ]),
          ];
        }

      case 'orderTotal':
      case 'shippingMethod':
      case 'paymentMethod':
        return [
          {
            id: subId('outer_container'),
            name: 'CONTAINER',
            type: 'sub_element',
            subElementId: 'outer_container',
            contentType,
            blockId,
            columnIndex,
            rootWidgetIndex,
            path: currentPath,
            children: [
              {
                id: subId('row_container'),
                name: 'CONTAINER',
                type: 'sub_element',
                subElementId: 'row_container',
                contentType,
                blockId,
                columnIndex,
                rootWidgetIndex,
                path: currentPath,
                children: [
                  {
                    id: subId('label_p'),
                    name: 'PARAGRAPH',
                    type: 'sub_element',
                    subElementId: 'label_p',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                  },
                  {
                    id: subId('value_p'),
                    name: 'PARAGRAPH',
                    type: 'sub_element',
                    subElementId: 'value_p',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                  }
                ]
              }
            ]
          }
        ];

      case 'emailHeader':
        return [
          {
            id: subId('outer_container'),
            name: 'CONTAINER',
            type: 'sub_element',
            subElementId: 'outer_container',
            contentType,
            blockId,
            columnIndex,
            rootWidgetIndex,
            path: currentPath,
            children: [
              {
                id: subId('header_container'),
                name: 'CONTAINER',
                type: 'sub_element',
                subElementId: 'header_container',
                contentType,
                blockId,
                columnIndex,
                rootWidgetIndex,
                path: currentPath,
                children: [
                  {
                    id: subId('header_title'),
                    name: 'HEADER',
                    type: 'sub_element',
                    subElementId: 'header_title',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                  }
                ]
              }
            ]
          }
        ];

      case 'emailFooter': {
        const defaultFooterOrder = ['social', 'address', 'contact', 'legal', 'copyright'];
        let footerOrder = defaultFooterOrder;
        try {
          const parsed = widget.contentData ? JSON.parse(widget.contentData) : {};
          if (Array.isArray(parsed.footerOrder)) {
            footerOrder = [
              ...parsed.footerOrder.filter((section: string) => defaultFooterOrder.includes(section)),
              ...defaultFooterOrder.filter(section => !parsed.footerOrder.includes(section)),
            ];
          }
        } catch (err) { }

        const makeNode = (elemId: string, name: string, children?: TreeItem[]): TreeItem => ({
          id: subId(elemId),
          name,
          type: 'sub_element',
          subElementId: elemId,
          contentType,
          blockId,
          columnIndex,
          rootWidgetIndex,
          path: currentPath,
          ...(children ? { children } : {})
        });

        const footerSections: Record<string, TreeItem> = {
          social: makeNode('footer_social', 'CONTAINER'),
          address: makeNode('footer_address', 'PARAGRAPH'),
          contact: makeNode('footer_contact', 'CONTAINER', [
            makeNode('footer_email_label', 'PARAGRAPH'),
            makeNode('footer_email_value', 'PARAGRAPH'),
            makeNode('footer_phone_label', 'PARAGRAPH'),
            makeNode('footer_phone_value', 'PARAGRAPH'),
          ]),
          legal: makeNode('footer_legal', 'CONTAINER', [
            makeNode('footer_privacy_link', 'PARAGRAPH'),
            makeNode('footer_terms_link', 'PARAGRAPH'),
          ]),
          copyright: makeNode('footer_copyright', 'PARAGRAPH'),
        };

        return [
          makeNode('outer_container', 'CONTAINER', [
            makeNode('footer_container', 'CONTAINER', footerOrder.map(section => footerSections[section]).filter(Boolean))
          ])
        ];
      }

      case 'ctaButton':
        return [
          {
            id: subId('outer_container'),
            name: 'CONTAINER',
            type: 'sub_element',
            subElementId: 'outer_container',
            contentType,
            blockId,
            columnIndex,
            rootWidgetIndex,
            path: currentPath,
            children: [
              {
                id: subId('button_container'),
                name: 'CONTAINER',
                type: 'sub_element',
                subElementId: 'button_container',
                contentType,
                blockId,
                columnIndex,
                rootWidgetIndex,
                path: currentPath,
                children: [
                  {
                    id: subId('button_elem'),
                    name: 'HEADER',
                    type: 'sub_element',
                    subElementId: 'button_elem',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                  }
                ]
              }
            ]
          }
        ];

      case 'customerNote':
        return [
          {
            id: subId('outer_container'),
            name: 'CONTAINER',
            type: 'sub_element',
            subElementId: 'outer_container',
            contentType,
            blockId,
            columnIndex,
            rootWidgetIndex,
            path: currentPath,
            children: [
              {
                id: subId('note_container'),
                name: 'CONTAINER',
                type: 'sub_element',
                subElementId: 'note_container',
                contentType,
                blockId,
                columnIndex,
                rootWidgetIndex,
                path: currentPath,
                children: [
                  {
                    id: subId('note_label'),
                    name: 'HEADER',
                    type: 'sub_element',
                    subElementId: 'note_label',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                  },
                  {
                    id: subId('note_value'),
                    name: 'PARAGRAPH',
                    type: 'sub_element',
                    subElementId: 'note_value',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                  }
                ]
              }
            ]
          }
        ];

      case 'contact':
        return [
          {
            id: subId('outer_container'),
            name: 'CONTAINER',
            type: 'sub_element',
            subElementId: 'outer_container',
            contentType,
            blockId,
            columnIndex,
            rootWidgetIndex,
            path: currentPath,
            children: [
              {
                id: subId('url_p'),
                name: 'PARAGRAPH',
                type: 'sub_element',
                subElementId: 'url_p',
                contentType,
                blockId,
                columnIndex,
                rootWidgetIndex,
                path: currentPath,
              },
              {
                id: subId('email_p'),
                name: 'PARAGRAPH',
                type: 'sub_element',
                subElementId: 'email_p',
                contentType,
                blockId,
                columnIndex,
                rootWidgetIndex,
                path: currentPath,
              },
              {
                id: subId('phone_p'),
                name: 'PARAGRAPH',
                type: 'sub_element',
                subElementId: 'phone_p',
                contentType,
                blockId,
                columnIndex,
                rootWidgetIndex,
                path: currentPath,
              }
            ]
          }
        ];

      case 'productDetails':
        return [
          {
            id: subId('outer_container'),
            name: 'CONTAINER',
            type: 'sub_element',
            subElementId: 'outer_container',
            contentType,
            blockId,
            columnIndex,
            rootWidgetIndex,
            path: currentPath,
            children: [
              {
                id: subId('table_container'),
                name: 'CONTAINER',
                type: 'sub_element',
                subElementId: 'table_container',
                contentType,
                blockId,
                columnIndex,
                rootWidgetIndex,
                path: currentPath,
                children: [
                  {
                    id: subId('header_row'),
                    name: 'CONTAINER',
                    type: 'sub_element',
                    subElementId: 'header_row',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                    children: [
                      {
                        id: subId('header_product'),
                        name: 'HEADER',
                        type: 'sub_element',
                        subElementId: 'header_product',
                        contentType,
                        blockId,
                        columnIndex,
                        rootWidgetIndex,
                        path: currentPath,
                      },
                      {
                        id: subId('header_quantity'),
                        name: 'HEADER',
                        type: 'sub_element',
                        subElementId: 'header_quantity',
                        contentType,
                        blockId,
                        columnIndex,
                        rootWidgetIndex,
                        path: currentPath,
                      },
                      {
                        id: subId('header_price'),
                        name: 'HEADER',
                        type: 'sub_element',
                        subElementId: 'header_price',
                        contentType,
                        blockId,
                        columnIndex,
                        rootWidgetIndex,
                        path: currentPath,
                      }
                    ]
                  },
                  {
                    id: subId('item_row'),
                    name: 'CONTAINER',
                    type: 'sub_element',
                    subElementId: 'item_row',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                    children: [
                      {
                        id: subId('item_product'),
                        name: 'PARAGRAPH',
                        type: 'sub_element',
                        subElementId: 'item_product',
                        contentType,
                        blockId,
                        columnIndex,
                        rootWidgetIndex,
                        path: currentPath,
                      },
                      {
                        id: subId('item_quantity'),
                        name: 'PARAGRAPH',
                        type: 'sub_element',
                        subElementId: 'item_quantity',
                        contentType,
                        blockId,
                        columnIndex,
                        rootWidgetIndex,
                        path: currentPath,
                      },
                      {
                        id: subId('item_price'),
                        name: 'PARAGRAPH',
                        type: 'sub_element',
                        subElementId: 'item_price',
                        contentType,
                        blockId,
                        columnIndex,
                        rootWidgetIndex,
                        path: currentPath,
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ];

      case 'relatedProducts':
        return [
          {
            id: subId('outer_container'),
            name: 'CONTAINER',
            type: 'sub_element',
            subElementId: 'outer_container',
            contentType,
            blockId,
            columnIndex,
            rootWidgetIndex,
            path: currentPath,
            children: [
              {
                id: subId('title_header'),
                name: 'HEADER',
                type: 'sub_element',
                subElementId: 'title_header',
                contentType,
                blockId,
                columnIndex,
                rootWidgetIndex,
                path: currentPath,
              },
              {
                id: subId('products_container'),
                name: 'CONTAINER',
                type: 'sub_element',
                subElementId: 'products_container',
                contentType,
                blockId,
                columnIndex,
                rootWidgetIndex,
                path: currentPath,
                children: [
                  {
                    id: subId('product_card'),
                    name: 'CONTAINER',
                    type: 'sub_element',
                    subElementId: 'product_card',
                    contentType,
                    blockId,
                    columnIndex,
                    rootWidgetIndex,
                    path: currentPath,
                    children: [
                      {
                        id: subId('product_title'),
                        name: 'PARAGRAPH',
                        type: 'sub_element',
                        subElementId: 'product_title',
                        contentType,
                        blockId,
                        columnIndex,
                        rootWidgetIndex,
                        path: currentPath,
                      },
                      {
                        id: subId('product_price'),
                        name: 'PARAGRAPH',
                        type: 'sub_element',
                        subElementId: 'product_price',
                        contentType,
                        blockId,
                        columnIndex,
                        rootWidgetIndex,
                        path: currentPath,
                      },
                      {
                        id: subId('product_button'),
                        name: 'BUTTON',
                        type: 'sub_element',
                        subElementId: 'product_button',
                        contentType,
                        blockId,
                        columnIndex,
                        rootWidgetIndex,
                        path: currentPath,
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ];

      default:
        return [
          {
            id: subId('outer_container'),
            name: 'CONTAINER',
            type: 'sub_element',
            subElementId: 'outer_container',
            contentType,
            blockId,
            columnIndex,
            rootWidgetIndex,
            path: currentPath,
            children: [
              {
                id: subId('inner_p'),
                name: 'PARAGRAPH',
                type: 'sub_element',
                subElementId: 'inner_p',
                contentType,
                blockId,
                columnIndex,
                rootWidgetIndex,
                path: currentPath,
              }
            ]
          }
        ];
    }
  })();

  // Parse custom subStyles from widget options
  let parsedContent: any = {};
  if (widget?.contentData) {
    try {
      parsedContent = JSON.parse(widget.contentData);
    } catch { }
  }
  const subStyles = parsedContent.subStyles || {};
  const defaultAddressFieldOrder = ['name', 'email', 'phone', 'address1', 'address2', 'city', 'state', 'postalCode', 'country'];
  const defaultOrderSubtotalRowOrder = ['subtotal', 'discount', 'shipping', 'refunded_full', 'refunded_partial'];
  const defaultOrderItemsSummaryRowOrder = ['subtotal', 'discount', 'payment', 'total'];
  const defaultTaxBillingTotalsRowOrder = ['subtotal', 'shipping', 'discount', 'tax', 'tax_rate', 'total'];
  const defaultTaxBillingAddressRowOrder = ['billing_name', 'billing_address_line', 'billing_location'];
  const defaultContactRowOrder = ['url', 'email', 'phone'];
  const getNormalizedAddressFieldOrder = () => {
    const orderKey = contentType === 'shippingAddress' ? 'shippingAddressFieldOrder' : 'billingAddressFieldOrder';
    const savedOrder = Array.isArray(parsedContent[orderKey]) ? parsedContent[orderKey] : [];
    return [
      ...savedOrder.filter((fieldId: string) => defaultAddressFieldOrder.includes(fieldId)),
      ...defaultAddressFieldOrder.filter(fieldId => !savedOrder.includes(fieldId)),
    ];
  };
  const getAddressSubElementLabel = (subElementId: string): string | null => {
    if (contentType !== 'billingAddress' && contentType !== 'shippingAddress') {
      return null;
    }

    const isBilling = contentType === 'billingAddress';
    if (subElementId === 'header_title') {
      return getContentLabelFromValue(parsedContent.title, isBilling ? 'BILL TO:' : 'SHIP TO:');
    }

    const fieldMap: Record<string, { labelKey: string; valueKey: string; label: string; value: string }> = {
      name: {
        labelKey: 'nameLabel',
        valueKey: 'fullName',
        label: isBilling ? 'Name:' : 'Name',
        value: isBilling ? '{{billing_name}}' : '{{shipping_name}}',
      },
      email: {
        labelKey: 'emailLabel',
        valueKey: 'email',
        label: isBilling ? 'Email:' : 'Email',
        value: isBilling ? '{{billing_email}}' : '{{shipping_email}}',
      },
      phone: {
        labelKey: 'phoneLabel',
        valueKey: 'phone',
        label: isBilling ? 'Phone:' : 'Phone',
        value: isBilling ? '{{billing_phone}}' : '{{shipping_phone}}',
      },
      address1: {
        labelKey: 'addressLine1Label',
        valueKey: 'addressLine1',
        label: isBilling ? 'Address Line 1:' : 'Address Line 1',
        value: isBilling ? '{{billing_address_1}}' : '{{shipping_address_1}}',
      },
      address2: {
        labelKey: 'addressLine2Label',
        valueKey: 'addressLine2',
        label: isBilling ? 'Address Line 2:' : 'Address Line 2',
        value: isBilling ? '{{billing_address_2}}' : '{{shipping_address_2}}',
      },
      city: {
        labelKey: 'cityLabel',
        valueKey: 'city',
        label: isBilling ? 'City:' : 'City',
        value: isBilling ? '{{billing_city}}' : '{{shipping_city}}',
      },
      state: {
        labelKey: 'stateLabel',
        valueKey: 'state',
        label: isBilling ? 'State:' : 'State',
        value: isBilling ? '{{billing_state}}' : '{{shipping_state}}',
      },
      postalCode: {
        labelKey: 'postalCodeLabel',
        valueKey: 'postalCode',
        label: isBilling ? 'Postal Code:' : 'Postal Code',
        value: isBilling ? '{{billing_postcode}}' : '{{shipping_postcode}}',
      },
      country: {
        labelKey: 'countryLabel',
        valueKey: 'country',
        label: isBilling ? 'Country:' : 'Country',
        value: isBilling ? '{{billing_country}}' : '{{shipping_country}}',
      },
    };

    const match = subElementId.match(/^(.+)_(label|value)$/);
    if (!match) return null;

    const field = fieldMap[match[1]];
    if (!field) return null;

    const key = match[2] === 'label' ? field.labelKey : field.valueKey;
    const fallback = match[2] === 'label' ? field.label : field.value;
    return getContentLabelFromValue(parsedContent[key], fallback);
  };
  const getOrderItemsSubElementLabel = (subElementId: string): string | null => {
    if (contentType !== 'orderItems') {
      return null;
    }

    const labels: Record<string, string> = {
      order_heading: getContentLabelFromValue(parsedContent.orderHeading, '[Order #{{order_id}}] ({{order_date}})'),
      header_product: getContentLabelFromValue(parsedContent.productHeader, 'Product'),
      header_quantity: getContentLabelFromValue(parsedContent.quantityHeader, 'Quantity'),
      header_price: getContentLabelFromValue(parsedContent.priceHeader, 'Price'),
      item_product: getContentLabelFromValue(parsedContent.productPlaceholder, '{{product_name}}'),
      item_quantity: getContentLabelFromValue(parsedContent.quantityPlaceholder, '{{qty}}'),
      item_price: getContentLabelFromValue(parsedContent.pricePlaceholder, '{{price}}'),
      subtotal_label: getContentLabelFromValue(parsedContent.subtotalLabel, 'Subtotal:'),
      subtotal_value: getContentLabelFromValue(parsedContent.subtotal, '{{order_subtotal}}'),
      discount_label: getContentLabelFromValue(parsedContent.discountLabel, 'Discount:'),
      discount_value: getContentLabelFromValue(parsedContent.discount, '{{order_discount}}'),
      payment_label: getContentLabelFromValue(parsedContent.paymentLabel, 'Payment method:'),
      payment_value: getContentLabelFromValue(parsedContent.paymentMethod, '{{payment_method}}'),
      total_label: getContentLabelFromValue(parsedContent.totalLabel, 'Total:'),
      total_value: getContentLabelFromValue(parsedContent.total, '{{order_total}}'),
    };
    return labels[subElementId] || null;
  };

  const getTaxBillingSubElementLabel = (subElementId: string): string | null => {
    if (contentType !== 'taxBilling') {
      return null;
    }

    const labels: Record<string, string> = {
      invoice_title: `${getContentLabelFromValue(parsedContent.invoiceTitle, 'Tax Invoice')} #${getContentLabelFromValue(parsedContent.orderNumber, '{{order_id}}')}`,
      order_date_label: getContentLabelFromValue(parsedContent.orderDateLabel, 'Order Date:'),
      order_date_value: getContentLabelFromValue(parsedContent.orderDate, '{{order_date}}'),
      subtotal_label: getContentLabelFromValue(parsedContent.subtotalLabel, 'Subtotal'),
      subtotal_value: getContentLabelFromValue(parsedContent.orderSubtotal, '{{order_subtotal}}'),
      shipping_label: getContentLabelFromValue(parsedContent.shippingLabel, 'Shipping'),
      shipping_value: getContentLabelFromValue(parsedContent.orderShipping, '{{shipping_cost}}'),
      discount_label: getContentLabelFromValue(parsedContent.discountLabel, 'Discount'),
      discount_value: getContentLabelFromValue(parsedContent.orderDiscount, '{{order_discount}}'),
      tax_label: getContentLabelFromValue(parsedContent.taxLabel, 'Tax'),
      tax_value: getContentLabelFromValue(parsedContent.orderTax, '{{tax_amount}}'),
      tax_rate_label: getContentLabelFromValue(parsedContent.taxRateLabel, 'Tax Rate'),
      tax_rate_value: getContentLabelFromValue(parsedContent.taxRate, '{{tax_rate}}'),
      total_label: getContentLabelFromValue(parsedContent.totalLabel, 'Total'),
      total_value: getContentLabelFromValue(parsedContent.orderTotal, '{{order_total}}'),
      billing_address_title: getContentLabelFromValue(parsedContent.billingAddressTitle, 'Billing Address:'),
      billing_name_label: getContentLabelFromValue(parsedContent.billingNameLabel, 'Name:'),
      billing_name_value: getContentLabelFromValue(parsedContent.billingFirstName, '{{billing_first_name}} {{billing_last_name}}'),
      billing_address_label: getContentLabelFromValue(parsedContent.billingAddressLabel, 'Address:'),
      billing_address_value: getContentLabelFromValue(parsedContent.billingAddress1, '{{billing_address_1}}'),
      billing_location_label: getContentLabelFromValue(parsedContent.billingLocationLabel, 'Location:'),
      billing_location_value: getContentLabelFromValue(parsedContent.billingCity, '{{billing_city}}, {{billing_state}} {{billing_postcode}}, {{billing_country}}'),
      footer_text: getContentLabelFromValue(parsedContent.footerText, 'Tax Billing'),
    };

    return labels[subElementId] || null;
  };

  const getOrderSubtotalSubElementLabel = (subElementId: string): string | null => {
    if (contentType !== 'orderSubtotal') {
      return null;
    }

    const labels: Record<string, string> = {
      subtotal_label: getContentLabelFromValue(parsedContent.subtotalLabel, 'Subtotal'),
      subtotal_value: getContentLabelFromValue(parsedContent.subtotalValue, '{{order_subtotal}}'),
      discount_label: getContentLabelFromValue(parsedContent.discountLabel, 'Discount'),
      discount_value: getContentLabelFromValue(parsedContent.discountValue, '{{order_discount}}'),
      shipping_label: getContentLabelFromValue(parsedContent.shippingLabel, 'Shipping'),
      shipping_value: getContentLabelFromValue(parsedContent.shippingValue, '{{order_shipping}}'),
      refunded_full_label: getContentLabelFromValue(parsedContent.refundedFullyLabel, 'Order fully refunded'),
      refunded_full_value: getContentLabelFromValue(parsedContent.refundedFullyValue, '{{order_total}}'),
      refunded_partial_label: getContentLabelFromValue(parsedContent.refundedPartialLabel, 'Refund'),
      refunded_partial_value: getContentLabelFromValue(parsedContent.refundedPartialValue, '{{refund_amount}}'),
      label_p: getContentLabelFromValue(parsedContent.label, 'Subtotal'),
      value_p: getContentLabelFromValue(parsedContent.value, '{{order_subtotal}}'),
    };

    return labels[subElementId] || null;
  };

  // Recursively map/rewrite name of sub_element items
  const mapSubElements = (items: TreeItem[]): TreeItem[] => {
    return items.map(item => {
      let mappedName = item.name;
      if (item.type === 'sub_element' && item.subElementId) {
        const contentLabel = getAddressSubElementLabel(item.subElementId) || getOrderItemsSubElementLabel(item.subElementId) || getTaxBillingSubElementLabel(item.subElementId) || getOrderSubtotalSubElementLabel(item.subElementId);
        if (contentLabel) {
          mappedName = contentLabel;
        } else {
          const customStyle = subStyles[item.subElementId] || {};
          if (customStyle.htmlTag) {
            const t = customStyle.htmlTag.toLowerCase();
            if (t.startsWith('h') && t.length === 2 && !isNaN(Number(t[1]))) {
              mappedName = 'HEADING';
            } else if (t === 'a') {
              mappedName = 'LINK';
            } else if (t === 'div' || t === 'section' || t === 'article') {
              mappedName = 'CONTAINER';
            } else if (t === 'span' || t === 'strong' || t === 'em') {
              mappedName = 'TEXT';
            } else {
              mappedName = 'PARAGRAPH';
            }
          }
        }
      }
      return {
        ...item,
        name: mappedName,
        children: item.children ? mapSubElements(item.children) : undefined
      };
    });
  };

  const orderedChildren = (() => {
    if (contentType === 'contact') {
      const savedOrder = Array.isArray(parsedContent.contactRowOrder) ? parsedContent.contactRowOrder : [];
      const order = [
        ...savedOrder.filter((rowId: string) => defaultContactRowOrder.includes(rowId)),
        ...defaultContactRowOrder.filter(rowId => !savedOrder.includes(rowId)),
      ];
      return rawChildren.map(item => {
        if (item.subElementId !== 'outer_container' || !item.children) return item;
        return {
          ...item,
          children: [...item.children].sort((a, b) => {
            const aRow = a.subElementId?.replace(/_p$/, '') || '';
            const bRow = b.subElementId?.replace(/_p$/, '') || '';
            return order.indexOf(aRow) - order.indexOf(bRow);
          }),
        };
      });
    }

    if (contentType === 'taxBilling') {
      const savedTotalsOrder = Array.isArray(parsedContent.taxBillingTotalsRowOrder) ? parsedContent.taxBillingTotalsRowOrder : [];
      const totalsOrder = [
        ...savedTotalsOrder.filter((rowId: string) => defaultTaxBillingTotalsRowOrder.includes(rowId)),
        ...defaultTaxBillingTotalsRowOrder.filter(rowId => !savedTotalsOrder.includes(rowId)),
      ];
      const savedAddressOrder = Array.isArray(parsedContent.taxBillingAddressRowOrder) ? parsedContent.taxBillingAddressRowOrder : [];
      const addressOrder = [
        ...savedAddressOrder.filter((rowId: string) => defaultTaxBillingAddressRowOrder.includes(rowId)),
        ...defaultTaxBillingAddressRowOrder.filter(rowId => !savedAddressOrder.includes(rowId)),
      ];

      return rawChildren.map(item => {
        if (item.subElementId !== 'outer_container' || !item.children) return item;
        return {
          ...item,
          children: item.children.map(child => {
            if (child.subElementId === 'totals_container' && child.children) {
              return {
                ...child,
                children: [...child.children].sort((a, b) => {
                  const aRow = a.subElementId?.replace(/_container$/, '') || '';
                  const bRow = b.subElementId?.replace(/_container$/, '') || '';
                  return totalsOrder.indexOf(aRow) - totalsOrder.indexOf(bRow);
                }),
              };
            }

            if (child.subElementId === 'billing_address_container' && child.children) {
              return {
                ...child,
                children: [...child.children].sort((a, b) => {
                  if (a.subElementId === 'billing_address_title') return -1;
                  if (b.subElementId === 'billing_address_title') return 1;
                  const aRow = a.subElementId?.replace(/_container$/, '') || '';
                  const bRow = b.subElementId?.replace(/_container$/, '') || '';
                  const aIndex = addressOrder.indexOf(aRow);
                  const bIndex = addressOrder.indexOf(bRow);
                  return (aIndex === -1 ? addressOrder.length : aIndex) - (bIndex === -1 ? addressOrder.length : bIndex);
                }),
              };
            }

            return child;
          }),
        };
      });
    }

    if (contentType === 'orderItems') {
      const savedOrder = Array.isArray(parsedContent.orderItemsSummaryRowOrder) ? parsedContent.orderItemsSummaryRowOrder : [];
      const order = [
        ...savedOrder.filter((rowId: string) => defaultOrderItemsSummaryRowOrder.includes(rowId)),
        ...defaultOrderItemsSummaryRowOrder.filter(rowId => !savedOrder.includes(rowId)),
      ];
      return rawChildren.map(item => {
        if (item.subElementId !== 'outer_container' || !item.children) return item;
        return {
          ...item,
          children: item.children.map(child => {
            if (child.subElementId !== 'table_container' || !child.children) return child;
            return {
              ...child,
              children: [...child.children].sort((a, b) => {
                const getOrderIndex = (subElementId?: string) => {
                  if (subElementId === 'header_row') return 0;
                  if (subElementId === 'item_row') return 1;
                  const rowId = subElementId?.replace(/_container$/, '') || '';
                  const index = order.indexOf(rowId);
                  return index === -1 ? order.length + 2 : index + 2;
                };
                return getOrderIndex(a.subElementId) - getOrderIndex(b.subElementId);
              }),
            };
          }),
        };
      });
    }

    if (contentType === 'orderSubtotal') {
      const savedOrder = Array.isArray(parsedContent.orderSubtotalRowOrder) ? parsedContent.orderSubtotalRowOrder : [];
      const order = [
        ...savedOrder.filter((rowId: string) => defaultOrderSubtotalRowOrder.includes(rowId)),
        ...defaultOrderSubtotalRowOrder.filter(rowId => !savedOrder.includes(rowId)),
      ];
      return rawChildren.map(item => {
        if (item.subElementId !== 'outer_container' || !item.children) return item;
        return {
          ...item,
          children: [...item.children].sort((a, b) => {
            const getOrderIndex = (subElementId?: string) => {
              if (subElementId === 'row_container') return order.length;
              const rowId = subElementId?.replace(/_container$/, '') || '';
              const index = order.indexOf(rowId);
              return index === -1 ? order.length + 1 : index;
            };
            return getOrderIndex(a.subElementId) - getOrderIndex(b.subElementId);
          }),
        };
      });
    }

    if (contentType !== 'billingAddress' && contentType !== 'shippingAddress') return rawChildren;
    const order = getNormalizedAddressFieldOrder();
    return rawChildren.map(item => {
      if (item.subElementId !== 'fields_container' || !item.children) return item;
      return {
        ...item,
        children: [...item.children].sort((a, b) => {
          const aField = a.subElementId?.replace(/_container$/, '') || '';
          const bField = b.subElementId?.replace(/_container$/, '') || '';
          return order.indexOf(aField) - order.indexOf(bField);
        }),
      };
    });
  })();

  return mapSubElements(orderedChildren);
};

const stripHtml = (value: string): string => {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

const truncateLabel = (value: string, maxLength = 42): string => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 3).trim()}...`;
};

const getContentLabelFromValue = (value: any, fallback: string): string => {
  const rawContent = typeof value === 'string' ? value : '';
  const label = truncateLabel(stripHtml(rawContent));
  return label || fallback;
};

const getWidgetContentLabel = (widget: any, fallback: string): string => {
  if (!widget?.contentData) return fallback;

  try {
    const data = JSON.parse(widget.contentData);
    return getContentLabelFromValue(data?.content, fallback);
  } catch {
    return fallback;
  }
};

export const buildWidgetTree = (
  widget: any,
  blockId: string,
  columnIndex: number,
  rootWidgetIndex: number,
  currentPath: any[]
): TreeItem => {
  let name = widget.contentType || 'Widget';
  name = name.toLowerCase();

  let headingType;
  if (name === 'heading' && widget.contentData) {
    try {
      const data = JSON.parse(widget.contentData);
      headingType = data.headingType;
    } catch (e) {}
  }

  let displayName = name ? name.toUpperCase() : 'CONTAINER';
  
  if (name === 'heading') {
    if (headingType === 'p' || headingType === 'span') {
      displayName = 'Paragraph';
    } else {
      displayName = 'Header';
    }
  } else if (name === 'text') {
    displayName = 'Paragraph';
  } else if (name === 'button') {
    displayName = 'Button';
  } else if (name === 'image') {
    displayName = 'Image';
  } else if (name === 'divider') {
    displayName = 'Divider';
  } else if (name === 'container' || name === 'row' || name === 'section') {
    displayName = 'Container';
  }

  const wooWidgets = [
    'billingaddress', 'shippingaddress', 'orderitems', 'taxbilling', 'emailheader',
    'emailfooter', 'ctabutton', 'relatedproducts', 'ordersubtotal', 'ordertotal',
    'shippingmethod', 'paymentmethod', 'customernote', 'contact', 'productdetails'
  ];
  if (wooWidgets.includes(name)) {
    displayName = widget.contentType.toUpperCase();
  }

  const treeNode: TreeItem = {
    id: widget.id || `outline_${blockId}_${columnIndex}_${rootWidgetIndex}_${currentPath.map((p: any) => p.childIdx).join('_')}`,
    name: displayName,
    type: 'widget',
    contentType: widget.contentType,
    blockId,
    columnIndex,
    rootWidgetIndex,
    path: currentPath,
    headingType
  };

  if (wooWidgets.includes(name)) {
    treeNode.children = getWooCommerceWidgetChildren(widget, blockId, columnIndex, rootWidgetIndex, currentPath);
    return treeNode;
  }

  if (widget.contentData) {
    try {
      const data = JSON.parse(widget.contentData);
      if (data.children && Array.isArray(data.children)) {
        treeNode.children = data.children.map((child: any, idx: number) => {
          const childPath = [...currentPath, { colIdx: -1, childIdx: idx }];
          return buildWidgetTree(child, blockId, columnIndex, rootWidgetIndex, childPath);
        });
      } else if (data.columnsData && Array.isArray(data.columnsData)) {
        treeNode.children = [];
        data.columnsData.forEach((col: any, colIdx: number) => {
          if (col.children && Array.isArray(col.children)) {
            col.children.forEach((child: any, childIdx: number) => {
              const childPath = [...currentPath, { colIdx, childIdx }];
              treeNode.children?.push(buildWidgetTree(child, blockId, columnIndex, rootWidgetIndex, childPath));
            });
          }
        });
      }
    } catch (e) {
      // Ignore JSON error
    }
  }

  return treeNode;
};

export const buildBlockTree = (block: any): TreeItem => {
  const childrenWidgets: TreeItem[] = [];
  block.columns.forEach((col: any, colIdx: number) => {
    const columnWidgets: TreeItem[] = [];
    if (col.widgetContents && Array.isArray(col.widgetContents)) {
      col.widgetContents.forEach((widget: any, widgetIdx: number) => {
        columnWidgets.push(buildWidgetTree(widget, block.id, colIdx, widgetIdx, []));
      });
    }

    childrenWidgets.push({
      id: `${block.id}-col-${colIdx}`,
      name: `Column ${colIdx + 1}`,
      type: 'column',
      blockId: block.id,
      columnIndex: colIdx,
      children: columnWidgets
    });
  });

  return {
    id: block.id,
    name: block.name || 'Section',
    type: 'block',
    blockId: block.id,
    children: childrenWidgets
  };
};

export const getSubElementSx = (subStyles: any, elementId: string) => {
  if (!subStyles || !subStyles[elementId]) return {};
  const styles = subStyles[elementId];
  const sx: any = {};

  if (styles.padding) {
    const unit = styles.paddingUnit || 'px';
    if (typeof styles.padding === 'object') {
      if (styles.padding.top !== undefined) sx.paddingTop = `${styles.padding.top}${unit}`;
      if (styles.padding.right !== undefined) sx.paddingRight = `${styles.padding.right}${unit}`;
      if (styles.padding.bottom !== undefined) sx.paddingBottom = `${styles.padding.bottom}${unit}`;
      if (styles.padding.left !== undefined) sx.paddingLeft = `${styles.padding.left}${unit}`;
    }
  }
  if (styles.margin) {
    const unit = styles.marginUnit || 'px';
    if (typeof styles.margin === 'object') {
      if (styles.margin.top !== undefined) sx.marginTop = `${styles.margin.top}${unit}`;
      if (styles.margin.right !== undefined) sx.marginRight = `${styles.margin.right}${unit}`;
      if (styles.margin.bottom !== undefined) sx.marginBottom = `${styles.margin.bottom}${unit}`;
      if (styles.margin.left !== undefined) sx.marginLeft = `${styles.margin.left}${unit}`;
    }
  }

  if (styles.backgroundColor) sx.backgroundColor = styles.backgroundColor;
  if (styles.color) sx.color = styles.color;
  if (styles.fontFamily) sx.fontFamily = styles.fontFamily === 'Global' ? 'inherit' : styles.fontFamily;
  if (styles.fontSize !== undefined && styles.fontSize !== '') sx.fontSize = typeof styles.fontSize === 'number' ? `${styles.fontSize}px` : styles.fontSize;
  if (styles.fontWeight) sx.fontWeight = styles.fontWeight;
  if (styles.textAlign) sx.textAlign = styles.textAlign;
  if (styles.lineHeight !== undefined && styles.lineHeight !== '') sx.lineHeight = styles.lineHeight;
  if (styles.letterSpacing !== undefined && styles.letterSpacing !== '') sx.letterSpacing = typeof styles.letterSpacing === 'number' ? `${styles.letterSpacing}px` : styles.letterSpacing;
  if (styles.letterSpace !== undefined && styles.letterSpace !== '') sx.letterSpacing = typeof styles.letterSpace === 'number' ? `${styles.letterSpace}px` : styles.letterSpace;
  if (styles.textTransform) sx.textTransform = styles.textTransform;

  // Custom unit-handling for width/height (auto-append px if numeric)
  if (styles.width !== undefined && styles.width !== '') {
    sx.width = typeof styles.width === 'number' || /^\d+$/.test(styles.width) ? `${styles.width}px` : styles.width;
  }
  if (styles.height !== undefined && styles.height !== '') {
    sx.height = typeof styles.height === 'number' || /^\d+$/.test(styles.height) ? `${styles.height}px` : styles.height;
  }

  // Flexbox Properties
  if (styles.display) sx.display = styles.display;
  if (styles.flexDirection) sx.flexDirection = styles.flexDirection;
  if (styles.justifyContent) sx.justifyContent = styles.justifyContent;
  if (styles.alignItems) sx.alignItems = styles.alignItems;
  if (styles.flexWrap) sx.flexWrap = styles.flexWrap;

  if (styles.columnGap !== undefined && styles.columnGap !== '') {
    sx.columnGap = typeof styles.columnGap === 'number' || /^\d+$/.test(styles.columnGap) ? `${styles.columnGap}px` : styles.columnGap;
  }
  if (styles.rowGap !== undefined && styles.rowGap !== '') {
    sx.rowGap = typeof styles.rowGap === 'number' || /^\d+$/.test(styles.rowGap) ? `${styles.rowGap}px` : styles.rowGap;
  }

  // Border Radius (if object, convert to string shorthand)
  if (styles.borderRadius) {
    const unit = styles.borderRadiusUnit || 'px';
    if (typeof styles.borderRadius === 'object') {
      const r = styles.borderRadius;
      sx.borderRadius = `${r.top ?? 0}${unit} ${r.right ?? 0}${unit} ${r.bottom ?? 0}${unit} ${r.left ?? 0}${unit}`;
    } else {
      sx.borderRadius = styles.borderRadius;
    }
  }

  // Borders
  const sides = ['Top', 'Right', 'Bottom', 'Left'];
  sides.forEach(side => {
    const key = `border${side}`;
    if (styles[`${key}Width`] !== undefined) {
      sx[`${key}Width`] = typeof styles[`${key}Width`] === 'number' ? `${styles[`${key}Width`]}px` : styles[`${key}Width`];
    }
    if (styles[`${key}Style`] !== undefined) sx[`${key}Style`] = styles[`${key}Style`];
    if (styles[`${key}Color`] !== undefined) sx[`${key}Color`] = styles[`${key}Color`];
  });

  if (styles.zIndex !== undefined && styles.zIndex !== '') {
    sx.zIndex = styles.zIndex;
  }

  return sx;
};

export const getElementSx = (styles: any) => {
  if (!styles) return {};
  const sx: any = {};

  if (styles.padding) {
    const unit = styles.paddingUnit || 'px';
    if (typeof styles.padding === 'object') {
      if (styles.padding.top !== undefined) sx.paddingTop = `${styles.padding.top}${unit}`;
      if (styles.padding.right !== undefined) sx.paddingRight = `${styles.padding.right}${unit}`;
      if (styles.padding.bottom !== undefined) sx.paddingBottom = `${styles.padding.bottom}${unit}`;
      if (styles.padding.left !== undefined) sx.paddingLeft = `${styles.padding.left}${unit}`;
    }
  }
  if (styles.margin) {
    const unit = styles.marginUnit || 'px';
    if (typeof styles.margin === 'object') {
      if (styles.margin.top !== undefined) sx.marginTop = `${styles.margin.top}${unit}`;
      if (styles.margin.right !== undefined) sx.marginRight = `${styles.margin.right}${unit}`;
      if (styles.margin.bottom !== undefined) sx.marginBottom = `${styles.margin.bottom}${unit}`;
      if (styles.margin.left !== undefined) sx.marginLeft = `${styles.margin.left}${unit}`;
    }
  }

  if (styles.backgroundColor) sx.backgroundColor = styles.backgroundColor;
  const bgImage = styles.backgroundImage || styles.bgImage;
  if (bgImage) {
    sx.backgroundImage = `url("${bgImage}")`;
    sx.backgroundSize = styles.backgroundSize || styles.bgSize || 'cover';
    sx.backgroundPosition = styles.backgroundPosition || styles.bgPosition || 'center';
    sx.backgroundRepeat = 'no-repeat';
  }
  if (styles.color) sx.color = styles.color;
  if (styles.fontFamily) sx.fontFamily = styles.fontFamily === 'Global' ? 'inherit' : styles.fontFamily;
  if (styles.fontSize !== undefined && styles.fontSize !== '') sx.fontSize = typeof styles.fontSize === 'number' ? `${styles.fontSize}px` : styles.fontSize;
  if (styles.fontWeight) sx.fontWeight = styles.fontWeight;
  if (styles.textAlign) sx.textAlign = styles.textAlign;
  if (styles.lineHeight !== undefined && styles.lineHeight !== '') sx.lineHeight = styles.lineHeight;
  if (styles.letterSpacing !== undefined && styles.letterSpacing !== '') sx.letterSpacing = typeof styles.letterSpacing === 'number' ? `${styles.letterSpacing}px` : styles.letterSpacing;
  if (styles.letterSpace !== undefined && styles.letterSpace !== '') sx.letterSpacing = typeof styles.letterSpace === 'number' ? `${styles.letterSpace}px` : styles.letterSpace;
  if (styles.textTransform) sx.textTransform = styles.textTransform;

  // Custom unit-handling for width/height (auto-append px if numeric)
  if (styles.width !== undefined && styles.width !== '') {
    sx.width = typeof styles.width === 'number' || /^\d+$/.test(styles.width) ? `${styles.width}px` : styles.width;
  }
  if (styles.height !== undefined && styles.height !== '') {
    sx.height = typeof styles.height === 'number' || /^\d+$/.test(styles.height) ? `${styles.height}px` : styles.height;
  }

  // Flexbox Properties
  if (styles.display) sx.display = styles.display;
  if (styles.flexDirection) sx.flexDirection = styles.flexDirection;
  if (styles.justifyContent) sx.justifyContent = styles.justifyContent;
  if (styles.alignItems) sx.alignItems = styles.alignItems;
  if (styles.flexWrap) sx.flexWrap = styles.flexWrap;

  if (styles.columnGap !== undefined && styles.columnGap !== '') {
    sx.columnGap = typeof styles.columnGap === 'number' || /^\d+$/.test(styles.columnGap) ? `${styles.columnGap}px` : styles.columnGap;
  }
  if (styles.rowGap !== undefined && styles.rowGap !== '') {
    sx.rowGap = typeof styles.rowGap === 'number' || /^\d+$/.test(styles.rowGap) ? `${styles.rowGap}px` : styles.rowGap;
  }

  // Border Radius (if object, convert to string shorthand)
  if (styles.borderRadius) {
    const unit = styles.borderRadiusUnit || 'px';
    if (typeof styles.borderRadius === 'object') {
      const r = styles.borderRadius;
      sx.borderRadius = `${r.top ?? 0}${unit} ${r.right ?? 0}${unit} ${r.bottom ?? 0}${unit} ${r.left ?? 0}${unit}`;
    } else {
      sx.borderRadius = styles.borderRadius;
    }
  }

  // Borders
  const borderSides = ['Top', 'Right', 'Bottom', 'Left'];
  borderSides.forEach(side => {
    const key = `border${side}`;
    if (styles[`${key}Width`] !== undefined) {
      sx[`${key}Width`] = typeof styles[`${key}Width`] === 'number' ? `${styles[`${key}Width`]}px` : styles[`${key}Width`];
    }
    if (styles[`${key}Style`] !== undefined) sx[`${key}Style`] = styles[`${key}Style`];
    if (styles[`${key}Color`] !== undefined) sx[`${key}Color`] = styles[`${key}Color`];
  });

  if (styles.zIndex !== undefined && styles.zIndex !== '') {
    sx.zIndex = styles.zIndex;
  }

  return sx;
};

export const replaceDynamicVariables = (text: string | number | undefined | null, forceResolve: boolean = false): string => {
  if (text === undefined || text === null || text === '') return '';
  return String(text)
    .replace(/\{\{site_name\}\}/g, 'john')
    .replace(/\{\{site_title\}\}/g, 'Example Site')
    .replace(/\{\{shop_url\}\}/g, 'https://www.example.com/shop')
    .replace(/\{\{home_url\}\}/g, 'https://www.example.com')
    .replace(/\{\{admin_email\}\}/g, 'admin@example.com')
    .replace(/\{\{first_name\}\}/g, 'John')
    .replace(/\{\{last_name\}\}/g, 'Smith')
    .replace(/\{\{email\}\}/g, 'john@example.com')
    .replace(/\{\{customer_email\}\}/g, 'john@example.com')
    .replace(/\{\{phone_number\}\}/g, '+1 (555) 123-4567')
    .replace(/\{\{company_name\}\}/g, 'Example Company')
    .replace(/\{\{site_url\}\}/g, 'https://www.example.com')
    .replace(/\{\{address\}\}/g, '123 Main Street, New York')
    .replace(/\{\{order_id\}\}/g, 'ORD-10001')
    .replace(/\{\{order_number\}\}/g, '10001')
    .replace(/\{\{order_subtotal\}\}/g, '$149.99')
    .replace(/\{\{order_total\}\}/g, '$199.99')
    .replace(/\{\{order_tax\}\}/g, '$12.50')
    .replace(/\{\{product_name\}\}/g, 'Premium Product')
    .replace(/\{\{quantity\}\}/g, '1')
    .replace(/\{\{price\}\}/g, '$29.99')
    .replace(/\{\{tracking_number\}\}/g, 'TRK123456789')
    .replace(/\{\{unsubscribe_url\}\}/g, 'Unsubscribe Link')
    .replace(/\{\{logo_url\}\}/g, 'https://via.placeholder.com/150x50?text=Store+Logo')
    .replace(/\{\{store_email\}\}/g, 'john@example.com')
    .replace(/\{\{store_phone\}\}/g, '+1 (555) 123-4567')
    .replace(/\{\{store_name\}\}/g, 'Example Company')
    .replace(/\{\{store_address\}\}/g, '123 Main Street, New York')
    .replace(/\{\{billing_name\}\}/g, 'John Smith')
    .replace(/\{\{billing_address\}\}/g, '123 Main Street')
    .replace(/\{\{billing_first_name\}\}/g, 'John')
    .replace(/\{\{billing_last_name\}\}/g, 'Smith')
    .replace(/\{\{billing_company\}\}/g, 'Example Company')
    .replace(/\{\{billing_address_1\}\}/g, '123 Main Street')
    .replace(/\{\{billing_address_2\}\}/g, 'Suite 400')
    .replace(/\{\{billing_city\}\}/g, 'New York')
    .replace(/\{\{billing_state\}\}/g, 'NY')
    .replace(/\{\{billing_postcode\}\}/g, '10001')
    .replace(/\{\{billing_country\}\}/g, 'USA')
    .replace(/\{\{billing_phone\}\}/g, '+1 (555) 123-4567')
    .replace(/\{\{billing_email\}\}/g, 'john@example.com')
    .replace(/\{\{shipping_name\}\}/g, 'John Smith')
    .replace(/\{\{shipping_first_name\}\}/g, 'John')
    .replace(/\{\{shipping_last_name\}\}/g, 'Smith')
    .replace(/\{\{shipping_company\}\}/g, 'Example Company')
    .replace(/\{\{shipping_address_1\}\}/g, '123 Main Street')
    .replace(/\{\{shipping_address_2\}\}/g, 'Suite 400')
    .replace(/\{\{shipping_city\}\}/g, 'New York')
    .replace(/\{\{shipping_state\}\}/g, 'NY')
    .replace(/\{\{shipping_postcode\}\}/g, '10001')
    .replace(/\{\{shipping_country\}\}/g, 'USA')
    .replace(/\{\{shipping_phone\}\}/g, '+1 (555) 123-4567')
    .replace(/\{\{shipping_email\}\}/g, 'john@example.com')
    .replace(/\{\{order_date\}\}/g, 'June 17, 2026')
    .replace(/\{\{order_date_time\}\}/g, 'June 17, 2026 14:30')
    .replace(/\{\{shipping_cost\}\}/g, '$15.00')
    .replace(/\{\{tax_amount\}\}/g, '$12.50')
    .replace(/\{\{tax_rate\}\}/g, '8.25%')
    .replace(/\{\{payment_method\}\}/g, 'Credit Card')
    .replace(/\{\{payment_url\}\}/g, 'https://www.example.com/pay')
    .replace(/\{\{transaction_id\}\}/g, 'TXN-987654321')
    .replace(/\{\{currency\}\}/g, 'USD')
    .replace(/\{\{order_status\}\}/g, 'Processing')
    .replace(/\{\{order_notes\}\}/g, 'Please deliver between 9 AM and 5 PM.')
    .replace(/\{\{order_note\}\}/g, 'Please deliver between 9 AM and 5 PM.')
    .replace(/\{\{order_received_url\}\}/g, 'https://www.example.com/order-received')
    .replace(/\{\{admin_order_url\}\}/g, 'https://www.example.com/wp-admin/post.php?post=10001&action=edit')
    .replace(/\{\{checkout_url\}\}/g, 'https://www.example.com/checkout')
    .replace(/\{\{my_account_url\}\}/g, 'https://www.example.com/my-account')
    .replace(/\{\{shipping_method\}\}/g, 'Flat rate')
    .replace(/\{\{order_discount\}\}/g, '$20.00')
    .replace(/\{\{order_shipping\}\}/g, '$15.00')
    .replace(/\{\{refund_amount\}\}/g, '$50.00')
    .replace(/\{\{refund_reason\}\}/g, 'Out of stock')
    .replace(/\{\{refund_id\}\}/g, 'RFD-555')
    .replace(/\{\{order_fully_refund\}\}/g, 'Your order has been fully refunded.')
    .replace(/\{\{order_partial_refund\}\}/g, 'Your order has been partially refunded.')
    .replace(/\{\{customer_name\}\}/g, 'John Smith')
    .replace(/\{\{customer_first_name\}\}/g, 'John')
    .replace(/\{\{customer_last_name\}\}/g, 'Smith')
    .replace(/\{\{customer_user_name\}\}/g, 'johnsmith')
    .replace(/\{\{customer_id\}\}/g, 'CUST-888')
    .replace(/\{\{user_login\}\}/g, 'johnsmith')
    .replace(/\{\{user_email\}\}/g, 'john@example.com')
    .replace(/\{\{user_password\}\}/g, '********')
    .replace(/\{\{reset_link\}\}/g, 'https://www.example.com/reset-password')
    .replace(/\{\{login_url\}\}/g, 'https://www.example.com/my-account')
    .replace(/\{\{set_password_url\}\}/g, 'https://www.example.com/set-password')
    .replace(/\{\{reset_password_url\}\}/g, 'https://www.example.com/reset-password')
    .replace(/\{\{current_year\}\}/g, new Date().getFullYear().toString())
    .replace(/\{\{email_subject\}\}/g, 'Your Order Receipt')
    .replace(/\{\{email_heading\}\}/g, 'Thank You For Your Order')
    .replace(/\{\{from_email\}\}/g, 'sales@example.com')
    .replace(/\{\{coupon_expire_date\}\}/g, 'December 31, 2026')
    .replace(/\{\{dokan_activation_link\}\}/g, 'https://www.example.com/dokan/activate')
    .replace(/\{\{button_text\}\}/g, 'View Your Order')
    .replace(/\{\{related_products_title\}\}/g, 'You Might Also Like')
    .replace(/\{\{product_name_1\}\}/g, 'Wireless Mouse')
    .replace(/\{\{product_name_2\}\}/g, 'USB-C Hub')
    .replace(/\{\{product_name_3\}\}/g, 'Laptop Stand')
    .replace(/\{\{product_name_4\}\}/g, 'Mechanical Keyboard')
    .replace(/\{\{product_price_1\}\}/g, '$29.99')
    .replace(/\{\{product_price_2\}\}/g, '$49.99')
    .replace(/\{\{product_price_3\}\}/g, '$39.99')
    .replace(/\{\{product_price_4\}\}/g, '$129.99')
    .replace(/\{\{product_image_1\}\}/g, 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=300&h=300&fit=crop')
    .replace(/\{\{product_image_2\}\}/g, 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=300&h=300&fit=crop')
    .replace(/\{\{product_image_3\}\}/g, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop')
    .replace(/\{\{product_image_4\}\}/g, 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=300&h=300&fit=crop')
    .replace(/\{\{customer_note\}\}/g, 'Please deliver between 9 AM and 5 PM.');
};

export const getSpacingStyle = (spacing: any, defaultVal: string = '0px') => {
  if (!spacing) return defaultVal;
  if (typeof spacing === 'string') return spacing;
  return `${spacing.top || 0}px ${spacing.right || 0}px ${spacing.bottom || 0}px ${spacing.left || 0}px`;
};
