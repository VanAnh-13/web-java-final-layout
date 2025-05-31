// This script fixes the schema-utils ValidationError issue
const fs = require('fs');
const path = require('path');

// Path to the validation file that's causing issues
const validateFilePath = path.join(__dirname, 'node_modules', 'schema-utils', 'dist', 'validate.js');

// Check if file exists
if (fs.existsSync(validateFilePath)) {
  let fileContent = fs.readFileSync(validateFilePath, 'utf8');
  
  // If the file contains the problematic import
  if (fileContent.includes("import ValidationError from './ValidationError'")) {
    // Replace the ES module import with a CommonJS require
    fileContent = fileContent.replace(
      "import ValidationError from './ValidationError'", 
      "const ValidationError = require('./ValidationError')"
    );
    
    // Write the modified content back
    fs.writeFileSync(validateFilePath, fileContent, 'utf8');
    console.log('Fixed schema-utils ValidationError import!');
  } else {
    console.log('No need to fix schema-utils - already using correct import');
  }
} else {
  console.log('schema-utils validate.js not found, no fix needed');
}
