const Airtable = require('airtable');
require('dotenv').config({ path: '.env.local' });

// Debug information
console.log('Environment variables:');
console.log('AIRTABLE_API_KEY:', process.env.AIRTABLE_API_KEY ? 'Present' : 'Missing');
console.log('AIRTABLE_BASE_ID:', process.env.AIRTABLE_BASE_ID ? 'Present' : 'Missing');

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID);

const crypto = require('crypto');

function generateVerificationCode() {
  // Generate a 6-character alphanumeric code
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

async function addVerificationCodes() {
  try {
    // First, let's try to read the table to verify access
    console.log('Attempting to read table...');
    const table = base('tbl9Jj8pIUABtsXRo'); // Using the table ID instead of name
    
    // Test read access first
    const testRecord = await table
      .select({
        maxRecords: 1,
        fields: ['Name 名子']
      })
      .firstPage();
    
    console.log('Successfully read table. Found records:', testRecord.length);

    // Get all profiles that don't have an email
    console.log('Fetching profiles without email addresses...');
    const records = await table
      .select({
        filterByFormula: `NOT({Email 電子信箱})`,
        fields: ['Name 名子', 'Email 電子信箱', 'Verification Code']
      })
      .all();

    console.log(`Found ${records.length} profiles without email addresses`);

    // Generate and update verification codes
    for (const record of records) {
      const verificationCode = generateVerificationCode();
      console.log(`Updating ${record.fields['Name 名子']} with code: ${verificationCode}`);
      
      await table.update(record.id, {
        'Verification Code': verificationCode
      });
    }

    console.log('Successfully updated all profiles with verification codes');
    
    // Print a summary of all updated profiles
    console.log('\nUpdated Profiles:');
    for (const record of records) {
      console.log(`- ${record.fields['Name 名子']}: ${record.fields['Verification Code']}`);
    }

  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      error: error.error
    });
  }
}

addVerificationCodes(); 
