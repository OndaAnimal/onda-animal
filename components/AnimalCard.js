import Link from "next/link";
import { useSiteSettings } from "./SiteSettingsProvider";
import { mediaUrl } from "../lib/mediaUrl";

export default function AnimalCard({ animal, priority = false }) {
  const { settings } = useSiteSettings();

  return (
    <article className="animal-card">
      <Link className="animal-photo-wrap" href={`/adocao/${animal.slug}`}>
        <img
          className="animal-photo"
          src={mediaUrl(animal.photos?.[0], { width: 720, height: 610, crop: "fill" })}
          alt={`Foto de ${animal.name}`}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
        />
        <span className="animal-status">{animal.status}</span>
        {animal.demo && <span className="animal-demo">EXEMPLO</span>}
      </Link>

      <div className="animal-card-body">
        <div className="animal-title-row">
          <div>
            <span className="animal-species">{animal.species}</span>
            <h3>{animal.name}</h3>
          </div>
          <span className="animal-sex">{animal.sex}</span>
        </div>

        <p>{animal.summary}</p>

        <div className="animal-meta">
          <span>{animal.age}</span>
          <span>{animal.size}</span>
          <span>{animal.city}</span>
        </div>

        {settings.showPublicAnimalViews !== false && (
          <div className="animal-card-views" title="Visualizações deste perfil">
            <span>◉</span>
            <strong>{Number(animal.viewCount || 0).toLocaleString("pt-BR")}</strong>
            <small>{Number(animal.viewCount || 0) === 1 ? "visualização" : "visualizações"}</small>
          </div>
        )}

        <div className="animal-health">
          <span className={animal.vaccinated ? "ok" : ""}>{animal.vaccinated ? "✓" : "○"} Vacinado</span>
          <span className={animal.neutered ? "ok" : ""}>{animal.neutered ? "✓" : "○"} Castrado</span>
        </div>

        <Link className="button primary full" href={`/adocao/${animal.slug}`}>
          Conhecer {animal.name}
        </Link>
      </div>
    </article>
  );
}
