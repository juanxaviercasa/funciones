import React from "react";
export function Setting({
  title,
  desc,
  checked,
  set,
}: {
  title: string;
  desc: string;
  checked: boolean;
  set: (v: boolean) => void;
}) {
  return (
    <label className="setting">
      <div>
        <b>{title}</b>
        <p>{desc}</p>
      </div>
      <input
        className="switch"
        type="checkbox"
        checked={checked}
        onChange={(e) => set(e.target.checked)}
      />
    </label>
  );
}
export function ProgressBar({ value }: { value: number }) {
  const bounded = Math.max(0, Math.min(100, value));
  return (
    <div
      className="progressbar"
      role="progressbar"
      aria-label="Progreso"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(bounded)}
    >
      <i style={{ width: `${bounded}%` }} />
    </div>
  );
}
