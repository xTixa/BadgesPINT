export default function SectionCard({ title, icon, actions, children, className = "" }) {
  return (
    <section className={`ui-card ${className}`.trim()}>
      {(title || actions) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title ? (
            <h5 className="ui-card-title mb-0">
              {icon ? <i className={`bi ${icon} mr-2`}></i> : null}
              {title}
            </h5>
          ) : (
            <div></div>
          )}
          {actions || null}
        </div>
      )}
      {children}
    </section>
  );
}
