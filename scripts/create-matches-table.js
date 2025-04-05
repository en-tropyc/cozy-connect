const Airtable = require('airtable');
require('dotenv').config({ path: '.env.local' });

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID);

async function createMatchesTable() {
  try {
    // Create the Matches table
    const table = await base.createTable('Matches', [
      {
        name: 'Swiper',
        type: 'singleLineText',
        description: 'The ID of the user who swiped right'
      },
      {
        name: 'Swiped',
        type: 'singleLineText',
        description: 'The ID of the user who was swiped on'
      },
      {
        name: 'Status',
        type: 'singleSelect',
        description: 'The status of the match',
        options: {
          choices: [
            { name: 'pending' },
            { name: 'accepted' },
            { name: 'rejected' }
          ]
        }
      }
    ]);

    console.log('Successfully created Matches table!');
    console.log('Table ID:', table.id);
  } catch (error) {
    console.error('Error creating Matches table:', error);
  }
}

createMatchesTable(); 
