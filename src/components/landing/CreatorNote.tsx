import { Link } from "react-router-dom";
import founderCardSquare from "@/assets/founder-card-square.png";

interface CreatorNoteProps {
  className?: string;
}

const CreatorNote = ({ className = "" }: CreatorNoteProps) => {
  return (
    <section className={`py-12 border-t border-border/40 ${className}`}>
      <div className="container-narrow">
        <div className="flex flex-col sm:flex-row items-center gap-6 max-w-2xl mx-auto">
          <Link to="/about" className="shrink-0">
            <img 
              src={founderCardSquare} 
              alt="Jag Mariappan, Founder of AXIVA" 
              className="w-16 h-16 rounded-full object-cover hover:shadow-lg transition-shadow"
            />
          </Link>
          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-foreground mb-1">About the Creator</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              AXIVA was created by{" "}
              <Link to="/about" className="text-accent hover:underline font-medium">
                Jag Mariappan
              </Link>{" "}
              to help leaders communicate with clarity and structure. Every feature is designed with an executive mindset.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreatorNote;
