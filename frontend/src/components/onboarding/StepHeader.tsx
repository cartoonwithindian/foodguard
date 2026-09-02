type StepHeaderProps = {
  title: string;
  subtitle?: string;
};

export function StepHeader({ title, subtitle }: StepHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.625rem]">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
