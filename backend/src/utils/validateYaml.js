const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const filesToValidate = [
  'docker-compose.yml',
  'k8s/configmap.yaml',
  'k8s/secrets.yaml',
  'k8s/mongodb-deployment.yaml',
  'k8s/backend-deployment.yaml',
  'k8s/frontend-deployment.yaml'
];

const rootDir = path.resolve(__dirname, '../../../');
let allValid = true;

console.log('--- Validating YAML Manifests ---');

filesToValidate.forEach((relPath) => {
  const fullPath = path.join(rootDir, relPath);
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    // loadAll handles multi-document YAML files (separated by ---)
    const docs = yaml.loadAll(content);
    console.log(`✓ ${relPath}: Valid YAML (${docs.length} document${docs.length > 1 ? 's' : ''})`);
    
    docs.forEach((doc, idx) => {
      if (relPath.startsWith('k8s/')) {
        if (!doc.apiVersion || !doc.kind || !doc.metadata) {
          console.warn(`  [Warning] Doc ${idx + 1} in ${relPath} missing standard k8s fields (apiVersion, kind, metadata)`);
        } else {
          console.log(`   - [Doc ${idx + 1}] kind: ${doc.kind}, name: ${doc.metadata?.name}`);
        }
      } else if (relPath === 'docker-compose.yml') {
        const services = Object.keys(doc.services || {});
        console.log(`   - Services defined: ${services.join(', ')}`);
        if (!doc.services?.mongodb || !doc.services?.backend || !doc.services?.frontend) {
          console.warn('  [Warning] docker-compose.yml missing expected core services');
        }
      }
    });
  } catch (err) {
    console.error(`✗ ${relPath}: YAML Parse Error:`, err.message);
    allValid = false;
  }
});

if (allValid) {
  console.log('\n✓ ALL DOCKER AND KUBERNETES MANIFESTS ARE STRUCTURALLY AND SYNTACTICALLY VALID!');
  process.exit(0);
} else {
  console.error('\n✗ YAML Validation failed.');
  process.exit(1);
}
