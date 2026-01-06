import { defineField, defineType } from 'sanity';
import type { PreviewValue } from 'sanity';

export const zine = defineType({
  name: 'zine',
  title: 'Zine',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'issueNumber',
      title: 'Issue Number',
      type: 'number',
      validation: (Rule) => Rule.min(1).integer(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'backCoverImage',
      title: 'Back Cover Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'pages',
      title: 'Pages',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
        },
      ],
      validation: (Rule) => Rule.min(1),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'coverImage',
      subtitle: 'publishedAt',
    },
    prepare(
      selection: {
        title?: string;
        media?: PreviewValue['media'];
        subtitle?: string;
      },
    ): PreviewValue {
      const { title, media, subtitle } = selection;
      return {
        title: title ?? 'Untitled zine',
        media,
        subtitle: subtitle ? new Date(subtitle).toLocaleDateString() : undefined,
      };
    },
  },
});
