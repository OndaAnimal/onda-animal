import ServiceDetail from "../../../components/ServiceDetail";
import { services } from "../../../data/services";

export default function Page() {
  const service = services.find((item) => item.slug === "exames");
  return <ServiceDetail service={service} />;
}
