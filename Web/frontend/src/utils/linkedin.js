export function openLinkedInAddCertification({ name, certUrl, issueDate, certId, organizationName = "Softinsa" }) {
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: name || "Badge",
    organizationName,
    certUrl: certUrl || "",
  });

  if (issueDate) {
    const parsed = new Date(issueDate);
    if (!Number.isNaN(parsed.getTime())) {
      params.set("issueYear", String(parsed.getFullYear()));
      params.set("issueMonth", String(parsed.getMonth() + 1));
    }
  }

  if (certId) {
    params.set("certId", certId);
  }

  window.open(
    `https://www.linkedin.com/profile/add?${params.toString()}`,
    "_blank",
    "noopener,noreferrer"
  );
}
