const { getCliClient } = require('sanity/cli');

const client = getCliClient({ apiVersion: '2025-01-01' });

const timelineDoc = {
  _id: 'timeline',
  _type: 'timeline',
  title: 'Timeline',
  startYear: 0,
  endYear: 2026,
  events: [
    {
      _key: 'americanRevolution',
      _type: 'timelineEvent',
      label: 'American Revolution',
      startYear: 1775,
      endYear: 1783,
      continent: 'northAmerica',
      datesLabel: '1775-1783',
    },
    {
      _key: 'frenchRevolution',
      _type: 'timelineEvent',
      label: 'French Revolution',
      startYear: 1789,
      endYear: 1799,
      continent: 'europe',
      datesLabel: '1789-1799',
    },
    {
      _key: 'louisXVIExecution',
      _type: 'timelineEvent',
      label: 'Louis XVI Execution',
      startYear: 1793,
      endYear: 1793,
      continent: 'europe',
      datesLabel: '1793',
    },
    {
      _key: 'marieAntoinetteExecution',
      _type: 'timelineEvent',
      label: 'Marie Antoinette Execution',
      startYear: 1793,
      endYear: 1793,
      continent: 'europe',
      datesLabel: '1793',
    },
    {
      _key: 'ww1',
      _type: 'timelineEvent',
      label: 'WWI',
      startYear: 1914,
      endYear: 1918,
      continent: 'europe',
      datesLabel: '1914-1918',
    },
    {
      _key: 'greatDepression',
      _type: 'timelineEvent',
      label: 'Great Depression',
      startYear: 1929,
      endYear: 1939,
      continent: 'europe',
      datesLabel: '1929-1939',
    },
    {
      _key: 'ww2',
      _type: 'timelineEvent',
      label: 'WWII',
      startYear: 1939,
      endYear: 1945,
      continent: 'europe',
      datesLabel: '1939-1945',
    },
    {
      _key: 'moonLanding',
      _type: 'timelineEvent',
      label: 'Moon Landing',
      startYear: 1969,
      endYear: 1969,
      continent: 'northAmerica',
      datesLabel: '1969',
    },
    {
      _key: 'nineEleven',
      _type: 'timelineEvent',
      label: '9/11',
      startYear: 2001,
      endYear: 2001,
      continent: 'northAmerica',
      datesLabel: '2001',
    },
    {
      _key: 'covid',
      _type: 'timelineEvent',
      label: 'COVID-19',
      startYear: 2019,
      endYear: 2022,
      continent: 'global',
      datesLabel: '2019-2022',
    },
  ],
};

async function run() {
  await client.createOrReplace(timelineDoc);
  console.log('Seeded timeline document with timeline events.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
