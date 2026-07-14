import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { exportToHTML } from './src/Components/utils/Export/HtmlExporter';

const WP = 'wp --allow-root --path=/var/www/html/wordpress-new';

const templates = [
  {id:'57',name:'Cancelled order (Admin)'},
  {id:'58',name:'Cancelled order (Customer)'},
  {id:'59',name:'Completed order (Customer)'},
  {id:'60',name:'Order details (Paid)'},
  {id:'61',name:'Order details (Pending)'},
  {id:'62',name:'Customer note'},
  {id:'63',name:'Failed order (Admin)'},
  {id:'64',name:'Failed order'},
  {id:'65',name:'New order (Admin)'},
  {id:'66',name:'New account (Customer)'},
  {id:'67',name:'Order on-hold (Customer)'},
  {id:'68',name:'Processing order (Customer)'},
  {id:'69',name:'Refunded order (Full)'},
  {id:'70',name:'Refunded order (Partial)'},
  {id:'71',name:'Reset password (Customer)'},
  {id:'72',name:'Cancelled order (Admin) 1'},
];

let updated = 0;
for (const t of templates) {
  const jsonFile = `/tmp/tpl_json_${t.id}.json`;
  try {
    const dbJson = execSync(`${WP} eval "global \\$wpdb; echo \\$wpdb->get_var(\\$wpdb->prepare(\\\"SELECT json_data FROM wp_wetc_email_templates WHERE id = %d\\\", ${t.id}));" 2>/dev/null`, { encoding: 'utf8' }).trim();
    if (dbJson && dbJson.startsWith('{') || dbJson.startsWith('[')) {
      fs.writeFileSync(jsonFile, dbJson);
    }
  } catch (e) {
    // Fallback to existing file if query fails
  }

  if (!fs.existsSync(jsonFile)) { console.log(`Skip ${t.id}: no JSON file`); continue; }
  const jsonData = fs.readFileSync(jsonFile, 'utf8');
  let blocks: any[];
  try { blocks = JSON.parse(jsonData); } catch(e) { console.log(`Skip ${t.id}: bad JSON`); continue; }
  
  try {
    const html = exportToHTML(blocks as any, {
      templateName: t.name,
      minify: false,
      generateIds: true,
      responsive: true,
      backgroundColor: '#f5f5f5'
    });
    const outFile = `/tmp/tpl_html_${t.id}.html`;
    fs.writeFileSync(outFile, html);
    
    // Update DB
    execSync(`${WP} eval "global \\$wpdb; \\$h=file_get_contents('/tmp/tpl_html_${t.id}.html'); \\$r=\\$wpdb->update('wp_wetc_email_templates',['html_content'=>\\$h],['id'=>${t.id}]); echo \\$r!==false?'OK':'FAIL';" 2>/dev/null`);
    console.log(`✅ Template ${t.id} (${t.name}): ${html.length} bytes`);
    updated++;
  } catch(e: any) { 
    console.log(`❌ Template ${t.id} (${t.name}): ${String(e.message).substring(0, 150)}`); 
  }
}
console.log(`\n✅ Done. Updated ${updated}/${templates.length} templates.`);
