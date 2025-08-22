# Clean and rebuild
rm -rf dist/
rm -rf node_modules/
npm install
npm run build

# Check the built file to see if the import is correct
head -5 dist/index.esm.js

# Repack
npm pack

# In your main project
cd ../project
npm uninstall solidjs-interactive-plot
npm install ../pkg-prototype/solidjs-interactive-plot-1.0.0.tgz