interface BlogPostContentProps {
  content: string;
}

export default function BlogPostContent({ content }: BlogPostContentProps) {
  return (
    <div className="prose prose-invert prose-lg max-w-none">
      {content.split("\n").map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <h2 key={i} className="text-2xl font-bold mt-10 mb-4">
              {line.replace("## ", "")}
            </h2>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <h3 key={i} className="text-xl font-semibold mt-8 mb-3">
              {line.replace("### ", "")}
            </h3>
          );
        }
        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <p key={i} className="font-semibold">
              {line.replace(/\*\*/g, "")}
            </p>
          );
        }
        // Handle bold text within lines
        if (line.includes("**")) {
          const parts = line.split(/(\*\*[^*]+\*\*)/g);
          return (
            <p key={i} className="text-muted-foreground leading-relaxed">
              {parts.map((part, j) =>
                part.startsWith("**") && part.endsWith("**") ? (
                  <strong key={j} className="text-foreground font-semibold">
                    {part.replace(/\*\*/g, "")}
                  </strong>
                ) : (
                  <span key={j}>{part}</span>
                )
              )}
            </p>
          );
        }
        // Italic lines
        if (line.startsWith("*") && line.endsWith("*") && !line.startsWith("**")) {
          return (
            <p key={i} className="text-muted-foreground italic leading-relaxed">
              {line.replace(/^\*|\*$/g, "")}
            </p>
          );
        }
        if (line.startsWith("- ")) {
          return (
            <li key={i} className="ml-4">
              {line.replace("- ", "")}
            </li>
          );
        }
        if (line.startsWith("|")) {
          return null;
        }
        if (line.trim() === "") {
          return <br key={i} />;
        }
        return (
          <p key={i} className="text-muted-foreground leading-relaxed">
            {line}
          </p>
        );
      })}
    </div>
  );
}
