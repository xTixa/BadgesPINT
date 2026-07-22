import EmailSignatureManager from "../../components/EmailSignatureManager";
import ServiceLineLayout from "./ServiceLineLayout";

export default function EmailSignatureSL() {
  return <EmailSignatureManager Layout={ServiceLineLayout} variant="responsible" />;
}
