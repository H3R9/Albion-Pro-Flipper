import React from 'react';
import Markdown from 'react-markdown';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface MarkdownMessageProps {
  content: string;
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <div className="markdown-body font-sans text-[15px] leading-relaxed">
      <Markdown
        components={{
          strong: ({node, ...props}: any) => <strong className="font-bold text-amber-400 drop-shadow-sm" {...props} />,
          h1: ({node, ...props}: any) => <h1 className="text-xl font-black text-slate-50 mt-5 mb-3 pb-2 border-b border-slate-700 flex items-center gap-2" {...props} />,
          h2: ({node, ...props}: any) => <h2 className="text-lg font-black text-slate-100 mt-5 mb-2 pb-1 border-b border-slate-800" {...props} />,
          h3: ({node, ...props}: any) => <h3 className="text-base font-bold text-slate-200 mt-4 mb-2" {...props} />,
          p: ({node, ...props}: any) => <p className="mb-3 text-slate-300 last:mb-0" {...props} />,
          ul: ({node, ...props}: any) => <ul className="list-none pl-1 mb-4 space-y-2 text-slate-300" {...props} />,
          ol: ({node, ...props}: any) => <ol className="list-decimal pl-5 mb-4 space-y-2 text-slate-300 marker:text-amber-600 marker:font-bold" {...props} />,
          li: ({node, children, ...props}: any) => {
            // Check if it's within an unordered list to add a custom bullet
            // Actually react-markdown doesn't pass list type directly to li easily, we can just use a simple dot or styling.
            // Let's just return standard li for ul by adding a custom pseudo-element in CSS or just letting tailwind handle it.
            // Wait, since I removed list-disc from ul, I'll add a flex container.
            return (
              <li className="flex items-start flex-col sm:flex-row sm:gap-2 mb-1" {...props}>
                <div className="hidden sm:block text-amber-500 mt-1 shrink-0">•</div>
                <div>{children}</div>
              </li>
            );
          },
          blockquote: ({node, ...props}: any) => <blockquote className="border-l-4 border-amber-500 pl-4 italic text-slate-400 my-4 bg-amber-500/5 py-2 pr-3 rounded-r-lg shadow-inner" {...props} />,
          code: ({node, inline, className, ...props}: any) => 
            inline 
              ? <code className="bg-slate-900/80 text-emerald-400 px-1.5 py-0.5 rounded font-mono text-[0.85em] border border-slate-700 shadow-sm" {...props} />
              : <code className="block bg-[#0b0c10] text-emerald-400 p-4 rounded-xl font-mono text-[0.85em] overflow-x-auto border border-emerald-500/20 my-4 shadow-inner" {...props} />,
          a: ({node, ...props}: any) => <a className="text-blue-400 hover:text-blue-300 underline underline-offset-4 font-medium transition-colors" target="_blank" rel="noreferrer" {...props} />,
          img: ({node, ...props}: any) => <Image src={props.src || ''} alt={props.alt || ""} className="inline-block object-contain" width={40} height={40} style={{ display: 'inline', marginTop: '-4px', verticalAlign: 'middle', marginRight: '6px' }} unoptimized />,
          table: ({node, ...props}: any) => <div className="overflow-x-auto my-5 rounded-lg border border-slate-700 bg-slate-900/50 shadow-md"><table className="w-full text-left border-collapse text-sm" {...props} /></div>,
          thead: ({node, ...props}: any) => <thead className="bg-[#0b0c10] text-slate-300 border-b border-slate-700 font-bold uppercase tracking-wider text-xs" {...props} />,
          th: ({node, ...props}: any) => <th className="p-3" {...props} />,
          td: ({node, ...props}: any) => <td className="p-3 border-b border-slate-800/80" {...props} />,
          tbody: ({node, ...props}: any) => <tbody className="divide-y divide-slate-800/30" {...props} />,
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
