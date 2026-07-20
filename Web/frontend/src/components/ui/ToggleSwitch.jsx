export default function ToggleSwitch({ checked, onChange, disabled = false, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#0F62FE]/30 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-[#0F62FE]" : "bg-slate-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
