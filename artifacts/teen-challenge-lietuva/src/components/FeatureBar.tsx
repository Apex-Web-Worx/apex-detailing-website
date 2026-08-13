import { features } from "@/data/features";

export function FeatureBar() {
  return (
    <section className="bg-navy text-white" aria-label="Pagrindinės vertybės">
      <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className={`flex gap-4 px-5 py-8 sm:px-8 ${
                index % 2 === 1 ? "bg-navy-dark/40 lg:bg-transparent" : ""
              } ${index >= 2 ? "bg-navy-dark/25 lg:bg-transparent" : ""}`}
            >
              <Icon className="mt-0.5 size-7 shrink-0 text-gold" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-extrabold uppercase tracking-[0.16em]">
                  {feature.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-white/75">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
