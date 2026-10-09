import React from "react";
import katex from "katex";

function renderLatex(latex: string) {
  return katex.renderToString(latex, {
    output: "htmlAndMathml",
    strict: "ignore",
    throwOnError: false,
    trust: false,
  });
}

export function Formula({
  latex,
  display = false,
}: {
  latex: string;
  display?: boolean;
}) {
  return (
    <span
      className={display ? "formula formula-display" : "formula"}
      dangerouslySetInnerHTML={{ __html: renderLatex(latex) }}
    />
  );
}

export function MathText({ children }: { children: string }) {
  return (
    <>
      {children
        .split(/(\$[^$]+\$)/g)
        .map((part, index) =>
          part.startsWith("$") && part.endsWith("$") ? (
            <Formula key={index} latex={part.slice(1, -1)} />
          ) : (
            part
          ),
        )}
    </>
  );
}
