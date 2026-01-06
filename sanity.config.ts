import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schemaTypes';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const hasStudioEnv = Boolean(projectId && dataset);

const studioConfig = hasStudioEnv
  ? defineConfig({
      name: 'default',
      title: 'Future Poetic',
      projectId: projectId!,
      dataset: dataset!,
      plugins: [deskTool(), visionTool()],
      schema: { types: schemaTypes },
    })
  : null;

export default studioConfig;
