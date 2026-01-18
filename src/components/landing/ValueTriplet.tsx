import { Shuffle, Layout, Send } from "lucide-react";

const values = [
  {
    icon: Shuffle,
    title: "From chaos to structure",
    description: "Transform scattered notes and ideas into organized, logical frameworks that communicate with precision."
  },
  {
    icon: Layout,
    title: "From structure to narrative",
    description: "Convert your frameworks into compelling stories that resonate with executives and drive decisions."
  },
  {
    icon: Send,
    title: "From narrative to delivery",
    description: "Export beautiful PDFs, slides, or shareable links ready for boardrooms and client presentations."
  }
];

const ValueTriplet = () => {
  return (
    <section id="how-it-works" className="section-padding relative">
      <div className="container-wide">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-accent font-medium text-sm uppercase tracking-wider mb-3">
            The AXORA Method
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Three steps to clarity
          </h2>
        </div>

        {/* Value cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {values.map((value, index) => (
            <div
              key={value.title}
              className="group relative glass-card p-8 card-hover"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-accent/10 text-accent mb-6 transition-transform group-hover:scale-110">
                <value.icon className="h-7 w-7" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {value.description}
              </p>

              {/* Step number */}
              <div className="absolute top-6 right-6 text-5xl font-bold text-white/[0.03]">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueTriplet;
