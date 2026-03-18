export default function PageHeader({ title, subtitle, icon }) {
  return (
    <header className="ui-page-header">
      <h3 className="ui-page-title">
        {icon ? <i className={`bi ${icon} mr-2`}></i> : null}
        {title}
      </h3>
      {subtitle ? <p className="ui-page-subtitle">{subtitle}</p> : null}
    </header>
  );
}
