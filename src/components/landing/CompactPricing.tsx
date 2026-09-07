import { Link } from "react-router-dom";
import { SUBSCRIPTION_TIERS } from "@/lib/subscription";

const CompactPricing = () => {
  const free = SUBSCRIPTION_TIERS.free;
  const pro = SUBSCRIPTION_TIERS.pro;

  return (
    <section className="border-t border-border/50 px-4 py-12 sm:py-14" aria-labelledby="home-pricing-title">
      <div className="container-wide grid gap-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div>
          <h2 id="home-pricing-title" className="text-2xl font-semibold sm:text-3xl">
            Start free. Export with Pro.
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Pro includes PDF and PowerPoint exports.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
          <div>
            <p className="text-sm text-muted-foreground">{free.name}</p>
            <p className="mt-1 text-2xl font-semibold">{free.monthlyPrice}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{pro.name}</p>
            <p className="mt-1 text-2xl font-semibold">
              {pro.monthlyPrice}<span className="text-sm font-normal text-muted-foreground">/month</span>
            </p>
          </div>
          <Link
            to="/pricing"
            className="min-h-[44px] self-center py-3 text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            View plans
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CompactPricing;