import { useTranslation } from "react-i18next";

const JOURNEY_STEP_KEYS = [
  { key: "paths", i18nKey: "paths" },
  { key: "service-lines", i18nKey: "serviceLines" },
  { key: "areas", i18nKey: "areas" },
  { key: "badges", i18nKey: "badges" },
  { key: "requirements", i18nKey: "requirements" },
];

export default function PublicJourneyStepper({ currentStep }) {
  const { t } = useTranslation();
  const JOURNEY_STEPS = JOURNEY_STEP_KEYS.map((step) => ({
    key: step.key,
    label: t(`journeyStepper.steps.${step.i18nKey}`),
  }));
  const currentIndex = JOURNEY_STEPS.findIndex((step) => step.key === currentStep);

  return (
    <div className="mb-6 rounded-xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {t("journeyStepper.title")}
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3">
        {JOURNEY_STEPS.map((step, index) => {
          const isDone = currentIndex > index;
          const isCurrent = currentIndex === index;

          return (
            <div
              key={step.key}
              className={`rounded-lg border px-3 py-2 text-center text-xs font-semibold sm:text-sm ${
                isCurrent
                  ? "border-[#0F62FE]/35 bg-[#0F62FE]/10 text-[#0F62FE]"
                  : isDone
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
            >
              <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-current text-[10px] sm:h-6 sm:w-6 sm:text-xs">
                {index + 1}
              </span>
              {step.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
