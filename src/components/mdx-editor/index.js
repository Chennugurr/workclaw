'use client';

import { forwardRef } from 'react';
import {
  MDXEditor,
  diffSourcePlugin,
  markdownShortcutPlugin,
  AdmonitionDirectiveDescriptor,
  directivesPlugin,
  frontmatterPlugin,
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
} from '@mdxeditor/editor';
import { Toolbar } from './toolbar';

function InitializedMDXEditor({ diffMarkdown, ...props }, ref) {
  const PLUGINS = [
    toolbarPlugin({ toolbarContents: () => <Toolbar /> }),
    listsPlugin(),
    quotePlugin(),
    headingsPlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin(),
    tablePlugin(),
    thematicBreakPlugin(),
    frontmatterPlugin(),
    codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
    codeMirrorPlugin({
      codeBlockLanguages: {
        js: 'JavaScript',
        ts: 'TypeScript',
        css: 'CSS',
        html: 'HTML',
        jsx: 'React JSX',
        tsx: 'React TSX',
        python: 'Python',
        ruby: 'Ruby',
        java: 'Java',
        c: 'C',
        cpp: 'C++',
        csharp: 'C#',
        go: 'Go',
        rust: 'Rust',
        swift: 'Swift',
        php: 'PHP',
        sql: 'SQL',
        shell: 'Shell',
        markdown: 'Markdown',
        mdx: 'MDX',
        yaml: 'YAML',
        json: 'JSON',
        txt: 'Plain Text',
        '': 'Unspecified',
      },
    }),
    directivesPlugin({
      directiveDescriptors: [AdmonitionDirectiveDescriptor],
    }),
    diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown }),
    markdownShortcutPlugin(),
  ];

  return <MDXEditor ref={ref} plugins={PLUGINS} {...props} />;
}

export const MdxEditor = forwardRef(InitializedMDXEditor);

MdxEditor.displayName = 'MdxEditor';
