import { defineField, defineType } from 'sanity';

export const timeline = defineType({
  name: 'timeline',
  title: 'Timeline',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'startYear',
      title: 'Start Year',
      type: 'number',
      validation: (Rule) => Rule.required().integer(),
      initialValue: 0,
    }),
    defineField({
      name: 'endYear',
      title: 'End Year',
      type: 'number',
      validation: (Rule) => Rule.required().integer(),
      initialValue: 2026,
    }),
    defineField({
      name: 'events',
      title: 'Events',
      type: 'array',
      of: [{ type: 'timelineEvent' }],
      validation: (Rule) => Rule.min(1),
    }),
  ],
  preview: {
    select: { title: 'title' },
    prepare(selection) {
      const { title } = selection as { title?: string };
      return { title: title ?? 'Timeline' };
    },
  },
});
