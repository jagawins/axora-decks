import { Link } from "react-router-dom";
const steps = [
  {
    num: "01",
    title: "Describe your goal",
  },
  {
    num: "02",
    title: "Review your deck",
  },
  {
    num: "03",
    title: "Present with confidence",
  },
];

const ValueTriplet = () => {
  return (
    <section className="border-b border-border/50 px-4 py-10 sm:py-12">
      <div className="container-wide">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-2xl font-semibold sm:text-3xl">
            From notes to presentation
          </h2>
          <Link to="/how-it-works" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            How it works
          </Link>
        </div>
        <ol className="mt-7 grid gap-4 sm:grid-cols-3 sm:gap-6">
          {steps.map((step) => (
            <li key={step.num} className="flex items-center gap-3 border-t border-border/60 pt-4">
              <span className="text-xs font-semibold text-accent">{step.num}</span>
              <h3 className="text-base font-medium">{step.title}</h3>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

export default ValueTriplet;
