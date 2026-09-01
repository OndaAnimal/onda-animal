import SiteShell from "../components/SiteShell";
import HomePageContent from "../components/HomePageContent";
import { animals } from "../data/animals";

export default function Home() {
  return (
    <SiteShell>
      <HomePageContent initialAnimals={animals} />
    </SiteShell>
  );
}
