"use client";

import Link from "next/link";
import { useMemo } from "react";
import { mediaUrl } from "../lib/mediaUrl";

export default function HomeAnimalCollage({ initialAnimals }) {
  const featured = useMemo(() => {
    const active = initialAnimals.filter((a) => a.status !== "Adotado" && a.status !== "Indisponível");
    const chosen = active.filter((a) => a.featured);
    return (chosen.length ? chosen : active).slice(0, 3);
  }, [initialAnimals]);

  return (
    <div className="adoption-hero-collage">
      {featured.map((animal, index) => (
        <Link key={animal.slug} href={`/adocao/${animal.slug}`} className={`hero-animal hero-animal-${index + 1}`}>
          <img
            src={mediaUrl(animal.photos?.[0], { width: index === 0 ? 760 : 560, height: index === 0 ? 620 : 480, crop: "fill" })}
            alt={animal.name}
            loading="eager"
            fetchPriority={index === 0 ? "high" : "auto"}
            decoding="async"
          />
          <div>
            <strong>{animal.name}</strong>
            <span>{animal.age} • {animal.city}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
