const fs = require('fs');
const file = '/var/www/html/wordpress-new/wp-content/plugins/woomailer/my-app/src/Components/LayoutColumn/Layouts/basicsLayout/WidgetsEditor/tableWidgetEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex24 = / {24}<Box display="flex" border="1px solid #ddd" borderRadius="3px" overflow="hidden">[\s\S]*?<\/Box>/g;

const repl24 = `                        <Box sx={{ bgcolor: '#fff', border: '1px solid #ddd', borderRadius: '4px', display: 'flex', alignItems: 'center', height: '26px' }}>
                          <ColorPicker label="" value={""} onChange={() => {}} size="small" />
                        </Box>`;

const regex22 = / {22}<Box display="flex" border="1px solid #ddd" borderRadius="3px" overflow="hidden">[\s\S]*?<\/Box>/g;

const repl22 = `                      <Box sx={{ bgcolor: '#fff', border: '1px solid #ddd', borderRadius: '4px', display: 'flex', alignItems: 'center', height: '26px' }}>
                        <ColorPicker label="" value={""} onChange={() => {}} size="small" />
                      </Box>`;

content = content.replace(regex24, repl24);
content = content.replace(regex22, repl22);

fs.writeFileSync(file, content);
console.log('Replaced all dummy color pickers.');
