import { asset } from "@/lib/utils";

type PageHeroProps = {
  title: string;
  description?: string;
  image?: string;
};

export function PageHero({
  title,
  description,
  image = "images/support.jpg",
}: PageHeroProps) {
  return (
    <section className="relative isolate overflow-hidden">
      <img src={asset(image)} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-navy-dark/78" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <h1 className="max-w-3xl text-3xl font-extrabold leading-tight text-white md:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-5 max-w-2xl text-lg text-white/80">{description}</p>
        ) : null}
        <span className="mt-6 block h-[3px] w-16 rounded-full bg-gold" aria-hidden="true" />
      </div>
    </section>
  );
}
