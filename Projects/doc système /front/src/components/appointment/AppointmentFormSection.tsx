import type { ReactNode } from "react";

type AppointmentFormSectionProps = {
  step: number;
  title: string;
  children: ReactNode;
};

export function AppointmentFormSection({
  step,
  title,
  children,
}: AppointmentFormSectionProps) {
  return (
    <section className="rounded-[1.75rem] bg-white p-8 shadow-soft sm:p-10">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-lg font-bold text-brand-red">
          {step}
        </div>
        <h2 className="text-3xl font-black text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}
