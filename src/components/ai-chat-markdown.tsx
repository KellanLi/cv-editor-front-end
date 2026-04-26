'use client';

import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeSanitize, { defaultSchema, type Options as SanitizeOptions } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { type ReactNode } from 'react';

const tableTags = [
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
] as const;

/** 在 `defaultSchema` 上补全 GFM 表格等结节的 tag 白名单（`hast-util-sanitize` 合并策略与默认表一致） */
const sanitizeSchema: SanitizeOptions = {
  ...defaultSchema,
  tagNames: [
    ...new Set([...(defaultSchema.tagNames ?? []), ...tableTags]),
  ] as string[],
  attributes: {
    ...defaultSchema.attributes,
  },
};

const linkComponent = (props: {
  href?: string;
  className?: string;
  children?: ReactNode;
}) => (
  <a
    href={props.href}
    className={`text-accent break-all underline ${props.className ?? ''}`.trim()}
    target="_blank"
    rel="noopener noreferrer"
  >
    {props.children}
  </a>
);

const codeComponent = (props: {
  className?: string;
  children?: ReactNode;
  node?: { tagName: string; properties?: { className?: string[] } };
  inline?: boolean;
}) => {
  const isBlock =
    props.className != null && props.className.includes('language-');
  if (isBlock) {
    return <code className={props.className}>{props.children}</code>;
  }
  return (
    <code
      className="bg-default-200/80 text-foreground/90 rounded-md px-1.5 py-0.5 font-mono text-[0.9em] dark:bg-white/15"
    >
      {props.children}
    </code>
  );
};

const markdownComponents: Partial<Components> = {
  a: linkComponent,
  code: codeComponent,
  pre: ({ children }) => (
    <pre className="my-1.5 max-w-full overflow-x-auto rounded-lg border border-black/5 bg-default-200/30 p-2.5 text-xs font-mono leading-normal dark:border-white/10">
      {children}
    </pre>
  ),
  p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>,
  h1: ({ children }) => (
    <h1 className="mt-0 mb-1.5 text-sm font-bold">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-2.5 mb-1 text-sm font-semibold first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-2 mb-0.5 text-sm font-semibold first:mt-0">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-1.5 mb-0.5 text-sm font-medium first:mt-0">{children}</h4>
  ),
  ul: ({ children }) => (
    <ul className="mb-1.5 list-outside list-disc pl-4 last:mb-0 marker:text-foreground/60">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-1.5 list-outside list-decimal pl-4 last:mb-0">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="my-0.5 pl-0.5">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-border text-foreground/85 my-1.5 border-l-2 pl-2.5 not-italic last:mb-0">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-default-200/80 my-2" />,
  table: ({ children }) => (
    <div className="my-1.5 max-w-full overflow-x-auto">
      <table className="w-full min-w-0 table-auto border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-default-100/50">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-black/5 last:border-0 dark:border-white/10">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="border border-black/5 px-2 py-1 font-medium dark:border-white/10">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-black/5 px-2 py-1 align-top dark:border-white/10">
      {children}
    </td>
  ),
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
};

type TAiChatMarkdownProps = {
  className?: string;
  content: string;
};

export function AiChatMarkdown(props: TAiChatMarkdownProps) {
  const { className, content } = props;

  return (
    <div
      className={`min-w-0 break-words text-left text-sm [&_a]:break-all ${
        className ?? ''
      }`.trim()}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
        components={markdownComponents}
        disallowedElements={['script', 'style']}
        skipHtml
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
