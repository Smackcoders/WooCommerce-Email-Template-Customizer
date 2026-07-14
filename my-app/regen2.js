const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// Try to load exportToHTML from bundle via jsdom
let exportToHTML = null;
try {
  const { JSDOM } = require('jsdom');
  const bundlePath = path.join(__dirname, 'build/js/app_bundle.js');
  const bundleCode = fs.readFileSync(bundlePath, 'utf8');
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', { runScripts: 'dangerously' });
  dom.window.eval(bundleCode);
  exportToHTML = dom.window.exportToHTML;
  if (exportToHTML) console.log('✅ exportToHTML loaded from bundle');
} catch(e) {
  console.log('⚠️  jsdom load failed:', e.message.substring(0, 100));
}

if (!exportToHTML) { console.log('exportToHTML not available'); process.exit(2); }

let updated = 0;
for (const t of templates) {
  const jsonFile = `/tmp/tpl_json_${t.id}.json`;
  if (!fs.existsSync(jsonFile)) { console.log(`Skip ${t.id}: no JSON file`); continue; }
  const jsonData = fs.readFileSync(jsonFile, 'utf8');
  let blocks;
  try { blocks = JSON.parse(jsonData); } catch(e) { console.log(`Skip ${t.id}: bad JSON`); continue; }
  try {
    const html = exportToHTML(blocks, { templateName: t.name, minify: false, generateIds: true, responsive: true, backgroundColor: '#f5f5f5' });
    const outFile = `/tmp/tpl_html_${t.id}.html`;
    fs.writeFileSync(outFile, html);
    console.log(`✅ Generated HTML for ${t.id} (${t.name}): ${html.length} bytes`);
    updated++;
  } catch(e) { console.log(`❌ Error ${t.id}: ${e.message.substring(0,200)}`); }
}
console.log(`\nGenerated ${updated} HTML files. Now importing to DB...`);
