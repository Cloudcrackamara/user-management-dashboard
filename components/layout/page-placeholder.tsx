type PagePlaceholderProps = {
  title: string;
  description: string;
};

/** Stand-in content for pages whose features are not built yet. */
export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section className="flex min-h-64 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center dark:border-zinc-700 dark:bg-zinc-950">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h2>
      <p className="max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </section>
  );
}
