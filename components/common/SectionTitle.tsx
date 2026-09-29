// Shared heading style: same size everywhere, with a small accent bar
function SectionTitle({ children, as: Tag = "h2" }: { children: React.ReactNode; as?: "h1" | "h2" }) {
  return (
    <Tag className="mb-5 flex items-center gap-3 text-2xl font-bold md:text-3xl">
      <span aria-hidden="true" className="h-7 w-1.5 rounded-full bg-accent" />
      {children}
    </Tag>
  );
}

export default SectionTitle;
