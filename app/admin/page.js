import AdminPanel from "../../components/AdminPanel";
import { animals } from "../../data/animals";

export const metadata = {
  title: "Admin | Onda Animal",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminPanel initialAnimals={animals} />;
}
