"use client";

import { useState } from "react";

export default function AnimalGallery({ animal }) {
  const [selected, setSelected] = useState(0);
  const photos = animal.photos || [];

  return (
    <div className="animal-gallery">
      <div className="animal-gallery-main">
        <img src={photos[selected]} alt={`${animal.name} - foto ${selected + 1}`} />
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
            <img src={photo} alt="" />
            <span>Foto {index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
