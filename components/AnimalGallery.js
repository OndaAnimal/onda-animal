"use client";

import { useState } from "react";
import { mediaUrl } from "../lib/mediaUrl";

export default function AnimalGallery({ animal }) {
  const [selected, setSelected] = useState(0);
  const photos = animal.photos || [];

  return (
    <div className="animal-gallery">
      <div className="animal-gallery-main">
        <img
          src={mediaUrl(photos[selected], { width: 1200, height: 1000, crop: "fill" })}
          alt={`${animal.name} - foto ${selected + 1}`}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <span className="gallery-counter">{selected + 1} / {photos.length}</span>
        {animal.demo && <span className="animal-demo detail-demo">EXEMPLO</span>}
      </div>

      <div className="animal-gallery-thumbs">
        {photos.map((photo, index) => (
          <button
            key={photo}
            type="button"
            className={selected === index ? "active" : ""}
            onClick={() => setSelected(index)}
            aria-label={`Ver foto ${index + 1} de ${animal.name}`}
          >
            <img
              src={mediaUrl(photo, { width: 240, height: 180, crop: "fill" })}
              alt=""
              loading="eager"
              decoding="async"
            />
            <span>Foto {index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
