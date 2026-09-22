import SiteShell from "../../components/SiteShell";
import NfgPageContent from "../../components/NfgPageContent";

export const metadata = {
  title: "Nota Fiscal Gaúcha | Onda Animal",
  description: "Veja como apoiar a Onda Animal pela Nota Fiscal Gaúcha.",
};

export default function NotaFiscalGauchaPage() {
  return (
    <SiteShell>
      <NfgPageContent />
    </SiteShell>
  );
}
