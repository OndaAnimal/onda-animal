"use client";

export default function CmsOptionEditor({
  title,
  description,
  options = [],
  defaultOptions = [],
  onChange,
}) {
  const list = Array.isArray(options) ? options : [];

  function updateAt(index, value) {
    const next = [...list];
    next[index] = value;
    onChange(next);
  }

  function addOption() {
    onChange([...list, ""]);
  }

  function removeOption(index) {
    onChange(list.filter((_, itemIndex) => itemIndex !== index));
  }

  function moveOption(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <article className="cms-option-editor">
      <header>
        <div>
          <h4>{title}</h4>
          {description && <p>{description}</p>}
        </div>
        <span>{list.filter((item) => String(item || "").trim()).length} opções</span>
      </header>

      <div className="cms-option-list">
        {list.map((option, index) => (
          <div className="cms-option-row" key={`${title}-${index}`}>
            <b>{index + 1}</b>
            <input
              value={option}
              onChange={(event) => updateAt(index, event.target.value)}
              placeholder="Digite a opção..."
            />
            <button
              type="button"
              title="Mover para cima"
              disabled={index === 0}
              onClick={() => moveOption(index, -1)}
            >
              ↑
            </button>
            <button
              type="button"
              title="Mover para baixo"
              disabled={index === list.length - 1}
              onClick={() => moveOption(index, 1)}
            >
              ↓
            </button>
            <button
              type="button"
              className="remove"
              title="Remover opção"
              onClick={() => removeOption(index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <footer>
        <button type="button" className="button secondary" onClick={addOption}>
          + Adicionar opção
        </button>
        <button
          type="button"
          className="cms-option-reset"
          onClick={() => onChange([...defaultOptions])}
        >
          Restaurar padrão
        </button>
      </footer>
    </article>
  );
}
