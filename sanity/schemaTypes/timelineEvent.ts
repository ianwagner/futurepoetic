import { defineField, defineType } from 'sanity';

export const timelineEvent = defineType({
  name: 'timelineEvent',
  title: 'Timeline Event',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'startYear',
      title: 'Start Year',
      type: 'number',
      validation: (Rule) => Rule.required().integer(),
    }),
    defineField({
      name: 'endYear',
      title: 'End Year',
      type: 'number',
      validation: (Rule) => Rule.required().integer(),
    }),
    defineField({
      name: 'continent',
      title: 'Region',
      type: 'string',
      options: {
        list: [
          { title: 'Europe', value: 'europe' },
          { title: 'North America', value: 'northAmerica' },
          { title: 'Global', value: 'global' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'datesLabel',
      title: 'Dates Label',
      type: 'string',
      description: 'Optional override for display (e.g. “1775-1783”).',
    }),
  ],
  preview: {
    select: {
      title: 'label',
      startYear: 'startYear',
      endYear: 'endYear',
    },
    prepare(selection) {
      const { title, startYear, endYear } = selection as {
        title?: string;
        startYear?: number;
        endYear?: number;
      };
      const range =
        startYear !== undefined && endYear !== undefined
          ? startYear === endYear
            ? `${startYear}`
            : `${startYear}-${endYear}`
          : undefined;
      return {
        title: title ?? 'Timeline event',
        subtitle: range,
      };
    },
  },
});
