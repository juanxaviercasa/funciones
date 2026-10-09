import { useEffect, useRef } from "react";
import { MathfieldElement } from "mathlive";
MathfieldElement.fontsDirectory = new URL(
  "mathlive-fonts/",
  document.baseURI,
).href;
MathfieldElement.soundsDirectory = null;
export default function MathInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const field = useRef<MathfieldElement | null>(null);
  useEffect(() => {
    const mf = new MathfieldElement();
    mf.setAttribute("aria-label", "Respuesta matemática");
    mf.mathVirtualKeyboardPolicy = "manual";
    const input = () => onChange(mf.value);
    mf.addEventListener("input", input);
    host.current?.appendChild(mf);
    field.current = mf;
    return () => {
      mf.removeEventListener("input", input);
      mf.remove();
      field.current = null;
    };
  }, [onChange]);
  useEffect(() => {
    if (field.current) {
      if (field.current.value !== value) field.current.value = value;
      field.current.readOnly = disabled;
    }
  }, [value, disabled]);
  return (
    <div className="math-answer">
      <p id="answer-help">
        Escribe un número o una fracción. También puedes usar el teclado del
        dispositivo.
      </p>
      <div ref={host} />
      <label>
        Alternativa con el teclado del dispositivo
        <input
          aria-label="Respuesta numérica alternativa"
          inputMode="decimal"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          placeholder="3, -2 o 1/2"
        />
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          field.current?.focus();
          window.mathVirtualKeyboard.show();
        }}
      >
        Abrir teclado matemático
      </button>
    </div>
  );
}
