#!/usr/bin/env node
/**
 * regenerate_html.js
 * Reads all templates, re-exports HTML from json_data via the compiled bundle.
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const wpCliBase = 'wp --allow-root --path=/var/www/html/wordpress-new';

// Get all templates
const rawTemplates = execSync(`${wpCliBase} db query "SELECT id, email_template_name, json_data FROM wp_wetc_email_templates WHERE json_data IS NOT NULL AND json_data != '' AND (status='publish' OR status IS NULL);" --skip-column-names 2>/dev/null`).toString();

if (!rawTemplates.trim()) { console.log('No templates found.'); process.exit(0); }

// Load exportToHTML from bundle via jsdom
let exportToHTML;
try {
  const jsdom = require('jsdom');
  const { JSDOM } = jsdom;
  const bundlePath = path.join(__dirname, 'build/js/app_bundle.js');
  const bundleCode = fs.readFileSync(bundlePath, 'utf8');
  const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', { runScripts: 'dangerously' });
  dom.window.eval(bundleCode);
  exportToHTML = dom.window.exportToHTML;
} catch(e) {
  console.error('Could not load bundle:', e.message);
}

if (!exportToHTML) {
  console.log('exportToHTML not available in bundle. Will use PHP-based approach instead.');
  process.exit(2);
}

const lines = rawTemplates.trim().split('\n');
let updated = 0;
for (const line of lines) {
  const parts = line.split('\t');
  if (parts.length < 3) continue;
  const id = parts[0].trim();
  const name = parts[1].trim();
  const jsonData = parts.slice(2).join('\t').trim();
  if (!jsonData || jsonData === 'NULL') continue;
  let blocks;
  try { blocks = JSON.parse(jsonData); } catch(e) { console.log(`Skip ${id}: bad JSON`); continue; }
  try {
    const html = exportToHTML(blocks, { templateName: name, minify: false, generateIds: true, responsive: true });
    const tmpFile = `/tmp/tpl_${id}.html`;
    fs.writeFileSync(tmpFile, html);
    execSync(`${wpCliBase} eval "global \\$wpdb; \\$h=file_get_contents('/tmp/tpl_${id}.html'); \\$wpdb->update('wp_wetc_email_templates',['html_content'=>\\$h],['id'=>${id}]); echo 'OK';" 2>/dev/null`);
    console.log(`✅ Template ${id} (${name})`);
    updated++;
  } catch(e) { console.log(`❌ Template ${id}: ${e.message}`); }
}
console.log(`Done. Updated ${updated} templates.`);
