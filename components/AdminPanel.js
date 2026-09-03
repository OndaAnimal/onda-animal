"use client";

import { useEffect, useMemo, useState } from "react";
import {
  loadAnimals,
  saveAnimals,
  loadApplications,
  saveApplications,
  loadFeedback,
  loadSettings,
  saveSettings,
  loadConnect,
  saveConnect,
  loadStories,
  saveStories,
  DEFAULT_SITE_SETTINGS,
} from "../lib/localData";
import { adminAction, adminLogin, adminLogout, adminSession, loadAdminState, uploadAdminImage } from "../lib/apiClient";
import { maskBrazilPhone, maskPin, maskYear } from "../lib/masks";
import { veterinarians as seedVeterinarians } from "../data/veterinarians";
import { ANIMAL_SELECTION_FIELDS, DEFAULT_ANIMAL_PROFILE_OPTIONS, OTHER_OPTION } from "../data/animalProfileOptions";
import CmsOptionEditor from "./CmsOptionEditor";

const emptyAnimal = {
  slug: "",
  name: "",
  species: "Cão",
  breed: "Sem raça definida",
  sex: "Macho",
  age: "",
  approximateBirth: "",
  size: "Médio",
  weight: "",
  city: "Gravataí",
  status: "Disponível",
  vaccinated: false,
  neutered: false,
  dewormed: false,
  specialNeeds: false,
  featured: false,
  demo: false,
  color: "",
  energy: "Moderada",
  temperament: [],
  compatibility: { dogs: "Não avaliado", cats: "Não avaliado", children: "Não avaliado" },
  idealHome: "",
  summary: "",
  story: "",
  observations: "",
  photos: [""],
  profileSelections: {},
};


const emptyVeterinarian = {
  slug: "",
  name: "",
  image: "",
  role: "",
  categories: [],
  units: [],
  graduation: "",
  crmv: "",
  highlight: "",
  summary: "",
  active: true,
  scheduleEnabled: true,
  order: 1,
};

const applicationStatusLabels = {
  EM_ANALISE: "Em análise",
  CONTATO_REALIZADO: "Contato realizado",
  APROVADO: "Aprovado",
  NAO_APROVADO: "Não aprovado",
  ADOTADO: "Adotado",
};

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function dataUrlToFile(dataUrl, filename) {
  return fetch(dataUrl)
    .then((response) => response.blob())
    .then((blob) => new File([blob], filename, { type: blob.type || "image/jpeg" }));
}

function Metric({ label, value, detail }) {
  return (
    <article className="admin-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

export default function AdminPanel({ initialAnimals }) {
  const [logged, setLogged] = useState(false);
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [animals, setAnimals] = useState(initialAnimals);
  const [profileViews, setProfileViews] = useState({});
  const [veterinarians, setVeterinarians] = useState(seedVeterinarians);
  const [applications, setApplications] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [editing, setEditing] = useState(null);
  const [editingVet, setEditingVet] = useState(null);
  const [vetForm, setVetForm] = useState(emptyVeterinarian);
  const [vetCategoriesText, setVetCategoriesText] = useState("");
  const [savingVetImage, setSavingVetImage] = useState(false);
  const [deleteVetSlug, setDeleteVetSlug] = useState(null);
  const [animalForm, setAnimalForm] = useState(emptyAnimal);
  const [temperamentText, setTemperamentText] = useState("");
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [deleteSlug, setDeleteSlug] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [toast, setToast] = useState("");
  const [connect, setConnect] = useState({ conversations: [], tickets: [], news: [], help: [] });
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [connectReply, setConnectReply] = useState("");
  const [stories, setStories] = useState([]);
  const [adoptionAnimal, setAdoptionAnimal] = useState(null);
  const [adoptionStoryForm, setAdoptionStoryForm] = useState({ photo: "", title: "", story: "", adoptionDate: "", familyName: "", familyCity: "" });
  const [savingAdoptionPhoto, setSavingAdoptionPhoto] = useState(false);
  const [settingsSection, setSettingsSection] = useState("visual");
  const [savingSettingImage, setSavingSettingImage] = useState("");
  const [panelLoading, setPanelLoading] = useState(true);
  const [migratingLegacyImages, setMigratingLegacyImages] = useState(false);

const [animalDraftKey, setAnimalDraftKey] = useState("rascunho-inicial");
  const [animalSelectionModal, setAnimalSelectionModal] = useState(null);
  const [animalSelectionDraft, setAnimalSelectionDraft] = useState([]);
  const [animalCustomModal, setAnimalCustomModal] = useState(null);
  const [animalCustomDraft, setAnimalCustomDraft] = useState("");

  useEffect(() => {
    setAnimals(loadAnimals(initialAnimals));
    setApplications(loadApplications());
    setFeedback(loadFeedback());
    setSettings(loadSettings());
    setStories(loadStories());

    let active = true;

    async function restore() {
      const authenticated = await adminSession();
      if (!active) return;

      if (!authenticated) {
        setPanelLoading(false);
        return;
      }

      setLogged(true);
      await hydrateAdmin();
    }

    restore();
    return () => { active = false; };
  }, [initialAnimals]);

  async function hydrateAdmin() {
    setPanelLoading(true);
    try {
      const state = await loadAdminState();
      setAnimals(Array.isArray(state.animals) ? state.animals : initialAnimals);
      setProfileViews(state.profileViews && typeof state.profileViews === "object" ? state.profileViews : {});
      setVeterinarians(Array.isArray(state.veterinarians) ? state.veterinarians : seedVeterinarians);
      setApplications(Array.isArray(state.applications) ? state.applications : []);
      setFeedback(Array.isArray(state.feedback) ? state.feedback : []);
      setSettings({ ...DEFAULT_SITE_SETTINGS, ...(state.settings || {}) });
      setStories(Array.isArray(state.stories) ? state.stories : []);

      const connectData = state.connect || { conversations: [], tickets: [], news: [], help: [] };
      setConnect(connectData);
      setSelectedConversationId((current) =>
        current && connectData.conversations?.some((item) => item.id === current)
          ? current
          : connectData.conversations?.[0]?.id || null
      );

      // cache local apenas para manter a UI rápida durante a sessão.
      localStorage.setItem("ondaAnimals", JSON.stringify(state.animals || []));
      localStorage.setItem("ondaVeterinarians", JSON.stringify(state.veterinarians || []));
      localStorage.setItem("onda_adoption_applications", JSON.stringify(state.applications || []));
      localStorage.setItem("ondaSiteFeedback", JSON.stringify(state.feedback || []));
      localStorage.setItem("ondaAdminSettings", JSON.stringify(state.settings || {}));
      localStorage.setItem("ondaAdoptionStories", JSON.stringify(state.stories || []));
    } catch (error) {
      console.error(error);
      notify(error.message || "Não foi possível carregar os dados do Neon.");
    } finally {
      setPanelLoading(false);
    }
  }

  function notify(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2600);
  }

  async function login(event) {
    event.preventDefault();
    setLoginError("");
    setPanelLoading(true);

    try {
      await adminLogin(pin);
      setLogged(true);
      await hydrateAdmin();
    } catch (error) {
      setLogged(false);
      setLoginError(error.message || "PIN incorreto.");
    } finally {
      setPanelLoading(false);
    }
  }


  useEffect(() => {
    if (!logged) return;

    const refreshConnect = async () => {
      try {
        const conversations = await adminAction("listConversations");
        const next = { conversations: conversations || [], tickets: [], news: [], help: [] };
        setConnect(next);
        setSelectedConversationId((current) =>
          current && next.conversations?.some((item) => item.id === current)
            ? current
            : next.conversations?.[0]?.id || null
        );
      } catch {
        // mantém o estado atual durante oscilações rápidas
      }
    };

    const interval = setInterval(refreshConnect, 5000);
    return () => clearInterval(interval);
  }, [logged]);

  const metrics = useMemo(() => {
    const available = animals.filter((a) => a.status === "Disponível").length;
    const adopted = animals.filter((a) => a.status === "Adotado").length;
    const pending = applications.filter((a) => a.status === "EM_ANALISE").length;
    const average = feedback.length
      ? (feedback.reduce((sum, item) => sum + Number(item.rating || 0), 0) / feedback.length).toFixed(1)
      : "—";
    const totalViews = Object.values(profileViews || {})
      .reduce((sum, item) => sum + Number(item?.total || 0), 0);
    return { available, adopted, pending, average, totalViews };
  }, [animals, applications, feedback, profileViews]);

  function beginNewVeterinarian() {
    const nextOrder = veterinarians.length
      ? Math.max(...veterinarians.map((item) => Number(item.order || 0))) + 1
      : 1;

    setEditingVet("new");
    setVetForm({ ...emptyVeterinarian, units: [], categories: [], order: nextOrder });
    setVetCategoriesText("");
    setDeleteVetSlug(null);
    setTab("veterinarians");
  }

  function beginEditVeterinarian(vet) {
    setEditingVet(vet.slug);
    setVetForm({
      ...emptyVeterinarian,
      ...vet,
      units: Array.isArray(vet.units) ? [...vet.units] : [],
      categories: Array.isArray(vet.categories) ? [...vet.categories] : [],
      active: vet.active !== false,
      scheduleEnabled: vet.scheduleEnabled !== false,
      order: Number(vet.order || 1),
    });
    setVetCategoriesText((vet.categories || []).join(", "));
    setDeleteVetSlug(null);
    setTab("veterinarians");
  }

  function updateVet(field, value) {
    setVetForm((current) => ({ ...current, [field]: value }));
  }

  function toggleVetUnit(unit) {
    setVetForm((current) => {
      const units = new Set(current.units || []);
      if (units.has(unit)) units.delete(unit);
      else units.add(unit);
      return { ...current, units: Array.from(units) };
    });
  }

  async function uploadVeterinarianImage(file) {
    if (!file) return;
    const slug = vetForm.slug || slugify(vetForm.name) || `vet-${Date.now()}`;
    setSavingVetImage(true);
    try {
      const uploaded = await uploadAdminImage(file, {
        scope: "veterinarian",
        key: `${slug}/presentation`,
      });
      updateVet("image", uploaded.url);
      notify("Apresentação enviada ao Cloudinary.");
    } catch (error) {
      notify(error.detail || error.message || "Não foi possível enviar a apresentação.");
    } finally {
      setSavingVetImage(false);
    }
  }

  async function saveVeterinarian(event) {
    event.preventDefault();

    const name = vetForm.name.trim();
    const slug = vetForm.slug || slugify(name);
    if (!name || !slug) {
      notify("Informe o nome do veterinário.");
      return;
    }
    if (!vetForm.image) {
      notify("Adicione a imagem/apresentação do veterinário.");
      return;
    }

    const record = {
      ...vetForm,
      slug,
      name,
      role: vetForm.role.trim(),
      graduation: String(vetForm.graduation || "").trim(),
      crmv: String(vetForm.crmv || "").trim(),
      highlight: vetForm.highlight.trim(),
      summary: vetForm.summary.trim(),
      categories: vetCategoriesText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      units: Array.isArray(vetForm.units) ? vetForm.units : [],
      active: Boolean(vetForm.active),
      scheduleEnabled: Boolean(vetForm.scheduleEnabled),
      order: Math.max(1, Number(vetForm.order || 1)),
    };

    let next;
    if (editingVet === "new") {
      if (veterinarians.some((item) => item.slug === slug)) {
        notify("Já existe um veterinário com este nome/slug.");
        return;
      }
      next = [...veterinarians, record];
    } else {
      next = veterinarians.map((item) => item.slug === editingVet ? record : item);
    }

    next.sort((a, b) => Number(a.order || 999) - Number(b.order || 999));

    try {
      await adminAction("saveResource", { resource: "veterinarians", value: next });
      setVeterinarians(next);
      localStorage.setItem("ondaVeterinarians", JSON.stringify(next));
      setEditingVet(null);
      setVetForm(emptyVeterinarian);
      setVetCategoriesText("");
      notify(editingVet === "new" ? "Veterinário cadastrado." : "Veterinário atualizado.");
    } catch (error) {
      notify(error.detail || error.message || "Não foi possível salvar o veterinário.");
    }
  }

  async function removeVeterinarian(slug) {
    const next = veterinarians.filter((item) => item.slug !== slug);
    try {
      await adminAction("saveResource", { resource: "veterinarians", value: next });
      setVeterinarians(next);
      localStorage.setItem("ondaVeterinarians", JSON.stringify(next));
      setDeleteVetSlug(null);
      notify("Veterinário removido.");
    } catch (error) {
      notify(error.detail || error.message || "Não foi possível remover o veterinário.");
    }
  }

  async function saveVeterinarianPageSettings() {
    try {
      const saved = await adminAction("saveResource", { resource: "settings", value: settings });
      const merged = { ...DEFAULT_SITE_SETTINGS, ...(saved || settings) };
      setSettings(merged);
      localStorage.setItem("ondaAdminSettings", JSON.stringify(merged));
      notify("Textos da página de veterinários salvos.");
    } catch (error) {
      notify(error.detail || error.message || "Não foi possível salvar as configurações da página.");
    }
  }

  function beginNewAnimal() {
    setEditing("new");
    setAnimalForm({ ...emptyAnimal, compatibility: { ...emptyAnimal.compatibility }, photos: [""], profileSelections: {} });
    setTemperamentText("");
    setAnimalDraftKey(`rascunho-${Date.now()}`);
    setTab("animals");
  }

  function beginEdit(animal) {
    setEditing(animal.slug);
    setAnimalForm({
      ...animal,
      compatibility: { ...emptyAnimal.compatibility, ...(animal.compatibility || {}) },
      photos: (animal.photos || []).filter(Boolean).length ? (animal.photos || []).filter(Boolean) : [""],
      profileSelections: { ...(animal.profileSelections || {}) },
    });
    setTemperamentText(Array.isArray(animal.temperament) ? animal.temperament.join(" • ") : "");
    setAnimalDraftKey(animal.slug || `rascunho-${Date.now()}`);
  }

  function updateAnimal(field, value) {
    setAnimalForm((current) => ({ ...current, [field]: value }));
  }

  function updateCompatibility(field, value) {
    setAnimalForm((current) => ({
      ...current,
      compatibility: { ...current.compatibility, [field]: value },
    }));
  }

async function uploadPhoto(index, file) {
  if (!file) return;
  const name = animalForm.name.trim();
  const slug = animalForm.slug || slugify(name) || animalDraftKey || `rascunho-${Date.now()}`;
  setSavingPhoto(true);
  try {
    const uploaded = await uploadAdminImage(file, {
      scope: "animal",
      key: `${slug}/photo-${index + 1}`,
    });
    setAnimalForm((current) => {
      const photos = [...current.photos];
      photos[index] = uploaded.url;
      return { ...current, photos };
    });
    notify(`Foto ${index + 1} enviada ao Cloudinary.`);
  } catch (error) {
    notify(error.detail || error.message || "Não foi possível enviar a foto.");
  } finally {
    setSavingPhoto(false);
  }
}

function addAnimalPhotoSlot() {
  setAnimalForm((current) => ({
    ...current,
    photos: [...(current.photos || []), ""],
  }));
}

function removeAnimalPhoto(index) {
  setAnimalForm((current) => {
    const next = (current.photos || []).filter((_, photoIndex) => photoIndex !== index);
    return { ...current, photos: next.length ? next : [""] };
  });
}




function getAnimalSelectionValue(field) {
  if (field === "temperament") return temperamentText;
  if (field === "compatibilityDogs") return String(animalForm.compatibility?.dogs || "");
  if (field === "compatibilityCats") return String(animalForm.compatibility?.cats || "");
  if (field === "compatibilityChildren") return String(animalForm.compatibility?.children || "");
  return String(animalForm[field] || "");
}

function formatAnimalSelectionValue(field, values) {
  const clean = (values || []).map((item) => String(item || "").trim()).filter(Boolean);

  if (field === "story") return clean.join(" ");
  if (field === "idealHome") return clean.join(" • ");
  return clean.join(" • ");
}

function getStoredAnimalSelections(field) {
  const stored = animalForm.profileSelections?.[field];
  if (Array.isArray(stored) && stored.length) return stored.slice(0, 3);

  if (field === "temperament" && Array.isArray(animalForm.temperament) && animalForm.temperament.length) {
    return animalForm.temperament.slice(0, 3);
  }

  const current = getAnimalSelectionValue(field).trim();
  return current ? [current] : [];
}

function setAnimalSelectionValue(field, values) {
  const clean = (Array.isArray(values) ? values : [values])
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 3);

  const displayValue = formatAnimalSelectionValue(field, clean);

  if (field === "temperament") {
    setTemperamentText(displayValue);
  } else if (field === "compatibilityDogs") {
    updateCompatibility("dogs", displayValue);
  } else if (field === "compatibilityCats") {
    updateCompatibility("cats", displayValue);
  } else if (field === "compatibilityChildren") {
    updateCompatibility("children", displayValue);
  } else {
    updateAnimal(field, displayValue);
  }

  setAnimalForm((current) => ({
    ...current,
    profileSelections: {
      ...(current.profileSelections || {}),
      [field]: clean,
    },
  }));
}

function openAnimalSelection(field) {
  const config = ANIMAL_SELECTION_FIELDS[field];
  if (!config) return;

  const configured = settings.animalProfileOptions?.[field];
  const baseOptions = Array.isArray(configured)
    ? configured
    : (DEFAULT_ANIMAL_PROFILE_OPTIONS[field] || []);

  const cleanOptions = [];
  const seen = new Set();
  baseOptions.forEach((item) => {
    const value = String(item || "").trim();
    if (!value || value.toLowerCase() === OTHER_OPTION.toLowerCase()) return;
    const key = value.toLocaleLowerCase("pt-BR");
    if (seen.has(key)) return;
    seen.add(key);
    cleanOptions.push(value);
  });

  const modalOptions = [...cleanOptions, OTHER_OPTION];
  const selected = getStoredAnimalSelections(field);
  const presetSelections = [];
  let customValue = "";

  selected.forEach((value) => {
    if (modalOptions.includes(value) && value !== OTHER_OPTION) {
      presetSelections.push(value);
    } else if (!customValue) {
      customValue = value;
    }
  });

  const draft = [...presetSelections];
  if (customValue && draft.length < 3) draft.push(OTHER_OPTION);

  setAnimalCustomDraft(customValue);
  setAnimalSelectionDraft(draft.slice(0, 3));
  setAnimalSelectionModal({ field, ...config, options: modalOptions });
}

function closeAnimalSelection() {
  setAnimalSelectionModal(null);
  setAnimalSelectionDraft([]);
}

function toggleAnimalSelectionOption(option) {
  setAnimalSelectionDraft((current) => {
    const selected = Array.isArray(current) ? current : [];
    if (selected.includes(option)) {
      return selected.filter((item) => item !== option);
    }
    if (selected.length >= 3) {
      notify("Você pode selecionar no máximo 3 opções.");
      return selected;
    }
    return [...selected, option];
  });
}

function applyAnimalSelection() {
  if (!animalSelectionModal || !animalSelectionDraft.length) return;

  const selected = animalSelectionDraft.slice(0, 3);

  if (selected.includes(OTHER_OPTION)) {
    setAnimalCustomModal({
      field: animalSelectionModal.field,
      title: animalSelectionModal.title,
      eyebrow: animalSelectionModal.eyebrow,
      selectedOptions: selected.filter((item) => item !== OTHER_OPTION),
    });
    closeAnimalSelection();
    return;
  }

  setAnimalSelectionValue(animalSelectionModal.field, selected);
  closeAnimalSelection();
  setAnimalCustomDraft("");
}

function clearAnimalSelection() {
  if (!animalSelectionModal) return;
  setAnimalSelectionValue(animalSelectionModal.field, []);
  closeAnimalSelection();
  setAnimalCustomDraft("");
}

function applyCustomAnimalSelection() {
  if (!animalCustomModal) return;
  const value = animalCustomDraft.trim();
  if (!value) return;

  const selected = [
    ...(animalCustomModal.selectedOptions || []),
    value,
  ].slice(0, 3);

  setAnimalSelectionValue(animalCustomModal.field, selected);
  setAnimalCustomModal(null);
  setAnimalCustomDraft("");
}

function closeCustomAnimalSelection() {
  setAnimalCustomModal(null);
  setAnimalCustomDraft("");
}


async function saveAnimal(event) {
    event.preventDefault();
    const slug = animalForm.slug || slugify(animalForm.name);
    if (!animalForm.name.trim() || !slug) {
      notify("Informe o nome do animal.");
      return;
    }
    const cleanPhotos = (animalForm.photos || []).filter(Boolean);
    if (!cleanPhotos.length) {
      notify("Adicione pelo menos uma foto do animal.");
      return;
    }

    const record = {
      ...animalForm,
      slug,
      photos: cleanPhotos,
      temperament: Array.isArray(animalForm.profileSelections?.temperament) && animalForm.profileSelections.temperament.length
        ? animalForm.profileSelections.temperament.slice(0, 3)
        : (temperamentText.trim() ? [temperamentText.trim()] : []),
    };

    let next;
    if (editing === "new") {
      if (animals.some((animal) => animal.slug === slug)) {
        notify("Já existe um animal com esse nome/slug.");
        return;
      }
      next = [record, ...animals];
    } else {
      next = animals.map((animal) => animal.slug === editing ? record : animal);
    }

    try {
      await adminAction("saveResource", { resource: "animals", value: next });
      setAnimals(next);
      localStorage.setItem("ondaAnimals", JSON.stringify(next));
      setEditing(null);
      notify(editing === "new" ? "Animal cadastrado no Neon." : "Animal atualizado no Neon.");
    } catch (error) {
      notify(error.message || "Não foi possível salvar o animal.");
    }
  }

  async function confirmDeleteAnimal(slug) {
    const next = animals.filter((animal) => animal.slug !== slug);
    try {
      await adminAction("saveResource", { resource: "animals", value: next });
      setAnimals(next);
      localStorage.setItem("ondaAnimals", JSON.stringify(next));
      setDeleteSlug(null);
      if (editing === slug) setEditing(null);
      notify("Animal removido do Neon.");
    } catch (error) {
      notify(error.message || "Não foi possível remover o animal.");
    }
  }

  function beginCompleteAdoption(animal) {
    setAdoptionAnimal(animal);
    setAdoptionStoryForm({
      photo: "",
      title: `${animal.name} encontrou uma família`,
      story: "",
      adoptionDate: new Date().toISOString().slice(0, 10),
      familyName: "",
      familyCity: animal.city || "",
    });
  }

async function uploadAdoptionPhoto(file) {
  if (!file || !adoptionAnimal) return;
  setSavingAdoptionPhoto(true);
  try {
    const uploaded = await uploadAdminImage(file, {
      scope: "story",
      key: `${adoptionAnimal.slug}/final`,
    });
    setAdoptionStoryForm((current) => ({ ...current, photo: uploaded.url }));
    notify("Foto da adoção enviada ao Cloudinary.");
  } catch (error) {
    notify(error.detail || error.message || "Não foi possível enviar a foto.");
  } finally {
    setSavingAdoptionPhoto(false);
  }
}

async function completeAdoption(event) {
    event.preventDefault();
    if (!adoptionAnimal) return;

    if (!adoptionStoryForm.photo) {
      notify("Adicione a nova foto da adoção.");
      return;
    }

    if (!adoptionStoryForm.title.trim() || !adoptionStoryForm.story.trim()) {
      notify("Preencha o título e a história da adoção.");
      return;
    }

    const storyId = `historia_${Date.now()}`;
    const storyRecord = {
      id: storyId,
      animalSlug: adoptionAnimal.slug,
      animalName: adoptionAnimal.name,
      originalPhoto: adoptionAnimal.photos?.[0] || "",
      photo: adoptionStoryForm.photo,
      title: adoptionStoryForm.title.trim(),
      story: adoptionStoryForm.story.trim(),
      adoptionDate: adoptionStoryForm.adoptionDate || new Date().toISOString().slice(0, 10),
      familyName: adoptionStoryForm.familyName.trim(),
      familyCity: adoptionStoryForm.familyCity.trim(),
      createdAt: new Date().toISOString(),
    };

    const nextStories = [storyRecord, ...stories.filter((item) => item.animalSlug !== adoptionAnimal.slug)];
    const nextAnimals = animals.map((animal) =>
      animal.slug === adoptionAnimal.slug
        ? {
            ...animal,
            status: "Adotado",
            featured: false,
            adoptedAt: storyRecord.adoptionDate,
            adoptionStoryId: storyId,
          }
        : animal
    );
    const nextApplications = applications.map((item) =>
      item.animalSlug === adoptionAnimal.slug && item.status === "APROVADO"
        ? { ...item, status: "ADOTADO" }
        : item
    );

    try {
      await Promise.all([
        adminAction("saveResource", { resource: "stories", value: nextStories }),
        adminAction("saveResource", { resource: "animals", value: nextAnimals }),
        adminAction("bulkApplications", { items: nextApplications }),
      ]);

      setStories(nextStories);
      setAnimals(nextAnimals);
      setApplications(nextApplications);
      localStorage.setItem("ondaAdoptionStories", JSON.stringify(nextStories));
      localStorage.setItem("ondaAnimals", JSON.stringify(nextAnimals));
      localStorage.setItem("onda_adoption_applications", JSON.stringify(nextApplications));
      setAdoptionAnimal(null);
      setAdoptionStoryForm({ photo: "", title: "", story: "", adoptionDate: "", familyName: "", familyCity: "" });
      notify(`${adoptionAnimal.name} foi publicado em Histórias.`);
    } catch (error) {
      notify(error.message || "Não foi possível concluir a adoção.");
    }
  }

  async function deleteStory(id) {
    const story = stories.find((item) => item.id === id);
    const next = stories.filter((item) => item.id !== id);
    const nextAnimals = story
      ? animals.map((animal) =>
          animal.adoptionStoryId === id ? { ...animal, adoptionStoryId: null } : animal
        )
      : animals;

    try {
      await Promise.all([
        adminAction("saveResource", { resource: "stories", value: next }),
        adminAction("saveResource", { resource: "animals", value: nextAnimals }),
      ]);
      setStories(next);
      setAnimals(nextAnimals);
      localStorage.setItem("ondaAdoptionStories", JSON.stringify(next));
      localStorage.setItem("ondaAnimals", JSON.stringify(nextAnimals));
      notify("História removida.");
    } catch (error) {
      notify(error.message || "Não foi possível remover a história.");
    }
  }

  async function quickStatus(slug, status) {
    const animal = animals.find((item) => item.slug === slug);

    if (status === "Adotado" && animal?.status !== "Adotado") {
      beginCompleteAdoption(animal);
      return;
    }

    const next = animals.map((item) => item.slug === slug ? { ...item, status } : item);
    try {
      await adminAction("saveResource", { resource: "animals", value: next });
      setAnimals(next);
      localStorage.setItem("ondaAnimals", JSON.stringify(next));
      notify(`Status alterado para ${status}.`);
    } catch (error) {
      notify(error.message || "Não foi possível alterar o status.");
    }
  }

  async function updateApplication(id, patch) {
    try {
      const updated = await adminAction("updateApplication", { id, patch });
      const next = applications.map((item) => item.id === id ? updated : item);
      setApplications(next);
      localStorage.setItem("onda_adoption_applications", JSON.stringify(next));
      setSelectedApplication((current) => current?.id === id ? updated : current);
      notify("Solicitação atualizada.");
    } catch (error) {
      notify(error.message || "Não foi possível atualizar a solicitação.");
    }
  }

  async function selectConnectConversation(id) {
    setSelectedConversationId(id);
    try {
      const conversations = await adminAction("markConversationRead", { id });
      setConnect({ conversations: conversations || [], tickets: [], news: [], help: [] });
    } catch (error) {
      console.error(error);
    }
  }

  async function replyForgeConnect(event) {
    event.preventDefault();
    const text = connectReply.trim();
    if (!text || !selectedConversationId) return;

    try {
      const conversations = await adminAction("sendSupportMessage", {
        id: selectedConversationId,
        message: {
          id: `support_${Date.now()}`,
          text,
          date: new Date().toISOString(),
        },
      });
      setConnect({ conversations: conversations || [], tickets: [], news: [], help: [] });
      setConnectReply("");
      notify("Mensagem enviada pelo Forge Connect.");
    } catch (error) {
      notify(error.message || "Não foi possível enviar a mensagem.");
    }
  }

  async function toggleConnectStatus(id) {
    const current = (connect.conversations || []).find((item) => item.id === id);
    const status = current?.status === "ENCERRADA" ? "ABERTA" : "ENCERRADA";

    try {
      const conversations = await adminAction("toggleConversationStatus", { id, status });
      setConnect({ conversations: conversations || [], tickets: [], news: [], help: [] });
    } catch (error) {
      notify(error.message || "Não foi possível alterar a conversa.");
    }
  }

  function updateSetting(field, value) {
    setSettings((current) => ({ ...current, [field]: value }));
  }

  function updateAnimalProfileOptions(field, value) {
    setSettings((current) => ({
      ...current,
      animalProfileOptions: {
        ...DEFAULT_ANIMAL_PROFILE_OPTIONS,
        ...(current.animalProfileOptions || {}),
        [field]: Array.isArray(value) ? value : [],
      },
    }));
  }

  function profileOptionsForCms(field) {
    const configured = settings.animalProfileOptions?.[field];
    return Array.isArray(configured)
      ? configured
      : [...(DEFAULT_ANIMAL_PROFILE_OPTIONS[field] || [])];
  }

  function normalizedProfileOptionsSettings(source = settings.animalProfileOptions) {
    const next = {};
    Object.keys(DEFAULT_ANIMAL_PROFILE_OPTIONS).forEach((field) => {
      const raw = Array.isArray(source?.[field])
        ? source[field]
        : DEFAULT_ANIMAL_PROFILE_OPTIONS[field];

      const seen = new Set();
      next[field] = raw
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .filter((item) => item.toLowerCase() !== OTHER_OPTION.toLowerCase())
        .filter((item) => {
          const key = item.toLocaleLowerCase("pt-BR");
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
    });
    return next;
  }

async function readSettingImage(file, field) {
  if (!file) return;

  const keyMap = {
    logo: "logo",
    favicon: "favicon",
    heroBannerImage: "hero-banner",
    socialImage: "social-image",
  };
  const key = keyMap[field];
  if (!key) return;

  setSavingSettingImage(field);
  try {
    const uploaded = await uploadAdminImage(file, { scope: "cms", key });
    updateSetting(field, uploaded.url);
    notify("Imagem enviada ao Cloudinary.");
  } catch (error) {
    notify(error.detail || error.message || "Não foi possível enviar a imagem.");
  } finally {
    setSavingSettingImage("");
  }
}

async function migrateLegacyImages() {
  if (migratingLegacyImages) return;
  setMigratingLegacyImages(true);
  let migrated = 0;

  try {
    const nextAnimals = await Promise.all(
      animals.map(async (animal) => {
        const photos = [...(animal.photos || [])];
        for (let index = 0; index < photos.length; index += 1) {
          if (typeof photos[index] === "string" && photos[index].startsWith("data:image/")) {
            const file = await dataUrlToFile(photos[index], `${animal.slug}-foto-${index + 1}.jpg`);
            const uploaded = await uploadAdminImage(file, {
              scope: "animal",
              key: `${animal.slug}/photo-${index + 1}`,
            });
            photos[index] = uploaded.url;
            migrated += 1;
          }
        }
        return { ...animal, photos };
      })
    );

    const nextStories = [];
    for (const story of stories) {
      let photo = story.photo;
      if (typeof photo === "string" && photo.startsWith("data:image/")) {
        const file = await dataUrlToFile(photo, `${story.animalSlug || story.id}-historia.jpg`);
        const uploaded = await uploadAdminImage(file, {
          scope: "story",
          key: `${story.animalSlug || "historia"}/final`,
        });
        photo = uploaded.url;
        migrated += 1;
      }
      nextStories.push({ ...story, photo });
    }

    const nextSettings = { ...settings };
    const settingImages = {
      logo: "logo",
      favicon: "favicon",
      heroBannerImage: "hero-banner",
      socialImage: "social-image",
    };
    for (const [field, key] of Object.entries(settingImages)) {
      const value = nextSettings[field];
      if (typeof value === "string" && value.startsWith("data:image/")) {
        const file = await dataUrlToFile(value, `${key}.jpg`);
        const uploaded = await uploadAdminImage(file, { scope: "cms", key });
        nextSettings[field] = uploaded.url;
        migrated += 1;
      }
    }

    if (!migrated) {
      notify("Não há imagens antigas em base64 para migrar.");
      return;
    }

    await Promise.all([
      adminAction("saveResource", { resource: "animals", value: nextAnimals }),
      adminAction("saveResource", { resource: "stories", value: nextStories }),
      adminAction("saveResource", { resource: "settings", value: nextSettings }),
    ]);

    setAnimals(nextAnimals);
    setStories(nextStories);
    setSettings(nextSettings);
    localStorage.setItem("ondaAnimals", JSON.stringify(nextAnimals));
    localStorage.setItem("ondaAdoptionStories", JSON.stringify(nextStories));
    localStorage.setItem("ondaAdminSettings", JSON.stringify(nextSettings));
    notify(`${migrated} imagem(ns) migrada(s) para o Cloudinary.`);
  } catch (error) {
    notify(error.detail || error.message || "Não foi possível migrar as imagens antigas.");
  } finally {
    setMigratingLegacyImages(false);
  }
}

async function resetSiteSettings() {
    const next = {
      ...DEFAULT_SITE_SETTINGS,
      adoptionWhatsApp: settings.adoptionWhatsApp || "",
      adoptionEmail: settings.adoptionEmail || "",
    };
    try {
      await adminAction("saveResource", { resource: "settings", value: next });
      setSettings(next);
      localStorage.setItem("ondaAdminSettings", JSON.stringify(next));
      notify("Personalização restaurada para o padrão.");
    } catch (error) {
      notify(error.message || "Não foi possível restaurar as configurações.");
    }
  }

  function exportSiteSettings() {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `onda-site-config-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    notify("Configurações exportadas.");
  }

  function importSiteSettings(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result);
        const next = { ...DEFAULT_SITE_SETTINGS, ...parsed };
        await adminAction("saveResource", { resource: "settings", value: next });
        setSettings(next);
        localStorage.setItem("ondaAdminSettings", JSON.stringify(next));
        notify("Configurações importadas para o Neon.");
      } catch (error) {
        notify(error.message || "Arquivo de configuração inválido.");
      }
    };
    reader.readAsText(file);
  }

  async function saveAdminSettings(event) {
    event.preventDefault();
    try {
      const nextSettings = {
        ...settings,
        animalProfileOptions: normalizedProfileOptionsSettings(),
      };
      const saved = await adminAction("saveResource", { resource: "settings", value: nextSettings });
      const merged = { ...DEFAULT_SITE_SETTINGS, ...(saved || nextSettings) };
      setSettings(merged);
      localStorage.setItem("ondaAdminSettings", JSON.stringify(saved || nextSettings));
      notify("Configurações publicadas no Neon.");
    } catch (error) {
      notify(error.message || "Não foi possível salvar as configurações.");
    }
  }

  if (panelLoading && !logged) {
    return (
      <main className="admin-login-page">
        <div className="admin-login-card admin-loading-card">
          <img src="/logo.png" alt="Onda Animal" />
          <span>CONECTANDO</span>
          <h1>Carregando painel...</h1>
          <p>Verificando sessão e conexão com o Neon.</p>
        </div>
      </main>
    );
  }

  if (!logged) {
    return (
      <main className="admin-login-page">
        <form className="admin-login-card" onSubmit={login}>
          <img src="/logo.png" alt="Onda Animal" />
          <span>ÁREA RESTRITA</span>
          <h1>Painel de Adoção</h1>
          <p>Entre com o PIN administrativo.</p>
          <label>
            <span>PIN</span>
            <input autoFocus type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(maskPin(e.target.value))} placeholder="••••" maxLength={8} />
          </label>
          {loginError && <div className="admin-login-error">{loginError}</div>}
          <button className="button primary full" type="submit">Entrar no painel</button>
          <small>PIN protegido no servidor pela variável <b>ADMIN_PIN</b>.</small>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      {toast && <div className="admin-toast">{toast}</div>}

      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src="/logo.png" alt="Onda Animal" />
          <div><strong>ONDA ANIMAL</strong><span>Painel de Adoção</span></div>
        </div>

        <nav>
          <button className={tab === "dashboard" ? "active" : ""} onClick={() => setTab("dashboard")}>⌂ <span>Visão geral</span></button>
          <button className={tab === "animals" ? "active" : ""} onClick={() => { setTab("animals"); setEditing(null); }}>♡ <span>Animais</span><b>{animals.length}</b></button>
          <button className={tab === "veterinarians" ? "active" : ""} onClick={() => { setTab("veterinarians"); setEditingVet(null); }}>✚ <span>Veterinários</span><b>{veterinarians.length}</b></button>
          <button className={tab === "stories" ? "active" : ""} onClick={() => setTab("stories")}>♥ <span>Histórias</span><b>{stories.length}</b></button>
          <button className={tab === "applications" ? "active" : ""} onClick={() => setTab("applications")}>▤ <span>Solicitações</span><b>{applications.length}</b></button>
          <button className={tab === "feedback" ? "active" : ""} onClick={() => setTab("feedback")}>★ <span>Avaliações</span><b>{feedback.length}</b></button>
          <button className={tab === "connect" ? "active" : ""} onClick={() => { setTab("connect"); const first = connect.conversations?.[0]?.id; if (first) selectConnectConversation(selectedConversationId || first); }}>💬 <span>Forge Connect</span><b>{(connect.conversations || []).filter((c) => (c.messages || []).some((m) => m.from === "client" && !m.readBySupport)).length}</b></button>
          <button className={tab === "settings" ? "active" : ""} onClick={() => setTab("settings")}>⚙ <span>Configurações</span></button>
        </nav>

        <div className="admin-sidebar-bottom">
          <a href="/" target="_blank" rel="noreferrer">↗ Abrir site</a>
          <button onClick={async () => { await adminLogout().catch(() => {}); setLogged(false); setPin(""); }}>Sair</button>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <small>PAINEL ADMINISTRATIVO</small>
            <h1>{tab === "dashboard" ? "Visão geral" : tab === "animals" ? "Animais" : tab === "veterinarians" ? "Veterinários" : tab === "stories" ? "Histórias de adoção" : tab === "applications" ? "Solicitações de adoção" : tab === "feedback" ? "Avaliações do site" : tab === "connect" ? "Forge Connect" : "Configurações"}</h1>
          </div>
          {tab === "animals" && !editing && <button className="button primary" onClick={beginNewAnimal}>+ Cadastrar animal</button>}
          {tab === "veterinarians" && !editingVet && <button className="button primary" onClick={beginNewVeterinarian}>+ Cadastrar veterinário</button>}
        </header>

        {tab === "dashboard" && (
          <div className="admin-content">
            <div className="admin-metrics-grid">
              <Metric label="Disponíveis" value={metrics.available} detail="animais para adoção" />
              <Metric label="Em análise" value={metrics.pending} detail="solicitações aguardando" />
              <Metric label="Adotados" value={metrics.adopted} detail="animais com novo lar" />
              <Metric label="Nota do site" value={metrics.average} detail={`${feedback.length} avaliações`} />
              <Metric label="Visualizações" value={metrics.totalViews.toLocaleString("pt-BR")} detail="perfis de animais" />
            </div>

            <div className="admin-dashboard-grid">
              <article className="admin-panel-card">
                <div className="admin-card-heading"><div><span>SOLICITAÇÕES</span><h2>Mais recentes</h2></div><button onClick={() => setTab("applications")}>Ver todas →</button></div>
                {applications.slice(0, 5).map((item) => (
                  <div className="admin-mini-row" key={item.id}>
                    <div><strong>{item.applicant?.fullName || "Sem nome"}</strong><span>Interesse em {item.animalName}</span></div>
                    <span className={`admin-status status-${item.status}`}>{applicationStatusLabels[item.status] || item.status}</span>
                  </div>
                ))}
                {!applications.length && <div className="admin-empty">Nenhuma solicitação recebida ainda.</div>}
              </article>

              <article className="admin-panel-card">
                <div className="admin-card-heading"><div><span>ANIMAIS</span><h2>Status</h2></div><button onClick={() => setTab("animals")}>Gerenciar →</button></div>
                {animals.slice(0, 5).map((animal) => (
                  <div className="admin-mini-row" key={animal.slug}>
                    <div className="admin-animal-mini"><img src={animal.photos?.[0]} alt="" /><div><strong>{animal.name}</strong><span>{animal.species} • {animal.age} • ◉ {Number(profileViews[animal.slug]?.total || 0).toLocaleString("pt-BR")}</span></div></div>
                    <span className="admin-animal-status">{animal.status}</span>
                  </div>
                ))}
              </article>
            </div>
          </div>
        )}

        {tab === "animals" && (
          <div className="admin-content">
            {!editing ? (
              <div className="admin-animal-list">
                {animals.map((animal) => (
                  <article className="admin-animal-row" key={animal.slug}>
                    <img src={animal.photos?.[0]} alt={animal.name} />
                    <div className="admin-animal-info">
                      <strong>{animal.name}</strong>
                      <span>{animal.species} • {animal.sex} • {animal.age} • {animal.city}</span>
                      <span className="admin-profile-view-count">
                        ◉ {Number(profileViews[animal.slug]?.total || 0).toLocaleString("pt-BR")} visualizações
                      </span>
                    </div>
                    <select value={animal.status} onChange={(e) => quickStatus(animal.slug, e.target.value)}>
                      <option>Disponível</option><option>Em processo</option><option>Adotado</option><option>Indisponível</option>
                    </select>
                    <div className="admin-row-actions">
                      <button onClick={() => beginEdit(animal)}>Editar</button>
                      {animal.status !== "Adotado" ? (
                        <button className="adoption-complete-btn" onClick={() => beginCompleteAdoption(animal)}>
                          ♥ Concluir adoção
                        </button>
                      ) : animal.adoptionStoryId ? (
                        <button className="story-published-btn" onClick={() => setTab("stories")}>
                          ✓ Em Histórias
                        </button>
                      ) : (
                        <button className="adoption-complete-btn" onClick={() => beginCompleteAdoption(animal)}>
                          + Criar história
                        </button>
                      )}
                      {deleteSlug === animal.slug ? (
                        <div className="admin-delete-confirm"><button onClick={() => confirmDeleteAnimal(animal.slug)}>Confirmar</button><button onClick={() => setDeleteSlug(null)}>Cancelar</button></div>
                      ) : <button className="danger" onClick={() => setDeleteSlug(animal.slug)}>Excluir</button>}
                    </div>
                  </article>
                ))}
                {!animals.length && <div className="admin-empty big">Nenhum animal cadastrado. Clique em “Cadastrar animal”.</div>}
              </div>
            ) : (
              <form className="admin-animal-form" onSubmit={saveAnimal}>
                <div className="admin-form-heading"><div><span>{editing === "new" ? "NOVO CADASTRO" : "EDITAR ANIMAL"}</span><h2>{editing === "new" ? "Cadastrar animal" : animalForm.name}</h2></div><button type="button" onClick={() => setEditing(null)}>Fechar ×</button></div>

                <div className="admin-form-section">
                  <h3>Fotos</h3>
                  <p>É obrigatória apenas 1 foto. Se tiver outras, adicione quantas quiser para formar a galeria.</p>
                  <div className="admin-photo-grid dynamic">
                    {(animalForm.photos || [""]).map((photo, index) => (
                      <div className="admin-photo-item" key={`${index}-${photo || "empty"}`}>
                        <label className="admin-photo-uploader">
                          {photo ? (
                            <>
                              <img src={photo} alt={`Foto ${index + 1}`} />
                              <span className="admin-photo-replace">Trocar foto</span>
                            </>
                          ) : (
                            <div>
                              <strong>+ {index === 0 ? "Foto principal" : `Foto ${index + 1}`}</strong>
                              <span>JPG, PNG ou WEBP</span>
                            </div>
                          )}
                          <input type="file" accept="image/*" onChange={(e) => uploadPhoto(index, e.target.files?.[0])} />
                        </label>
                        {(animalForm.photos || []).length > 1 && (
                          <button className="admin-photo-remove" type="button" onClick={() => removeAnimalPhoto(index)}>
                            Remover
                          </button>
                        )}
                      </div>
                    ))}

                    <button className="admin-add-photo" type="button" onClick={addAnimalPhotoSlot}>
                      <span>＋</span>
                      <strong>Adicionar outra foto</strong>
                      <small>Opcional</small>
                    </button>
                  </div>
                  {savingPhoto && <small className="admin-uploading">Enviando foto para o Cloudinary...</small>}

                </div>

                <div className="admin-form-section">
                  <h3>Identificação</h3>
                  <div className="admin-fields-grid">
                    <label className="span-2"><span>Nome *</span><input value={animalForm.name} onChange={(e) => updateAnimal("name", e.target.value)} /></label>
                    <label><span>Espécie</span><select value={animalForm.species} onChange={(e) => updateAnimal("species", e.target.value)}><option>Cão</option><option>Gato</option></select></label>
                    <label><span>Sexo</span><select value={animalForm.sex} onChange={(e) => updateAnimal("sex", e.target.value)}><option>Macho</option><option>Fêmea</option></select></label>
                    <label><span>Idade</span><input value={animalForm.age} onChange={(e) => updateAnimal("age", e.target.value)} placeholder="Ex.: 2 anos" /></label>
                    <label><span>Nascimento aproximado</span><input inputMode="numeric" value={animalForm.approximateBirth || ""} onChange={(e) => updateAnimal("approximateBirth", maskYear(e.target.value))} placeholder="Ex.: 2024" maxLength={4} /></label>
                    <label><span>Raça</span><input value={animalForm.breed || ""} onChange={(e) => updateAnimal("breed", e.target.value)} /></label>
                    <label><span>Cor</span><input value={animalForm.color || ""} onChange={(e) => updateAnimal("color", e.target.value)} /></label>
                    <label><span>Porte</span><select value={animalForm.size} onChange={(e) => updateAnimal("size", e.target.value)}><option>Pequeno</option><option>Médio</option><option>Grande</option></select></label>
                    <label><span>Peso</span><input value={animalForm.weight || ""} onChange={(e) => updateAnimal("weight", e.target.value)} placeholder="Ex.: 14 kg" /></label>
                    <label><span>Unidade/Cidade</span><select value={animalForm.city} onChange={(e) => updateAnimal("city", e.target.value)}><option>Gravataí</option><option>Cachoeirinha</option></select></label>
                    <label><span>Status</span><select value={animalForm.status} onChange={(e) => updateAnimal("status", e.target.value)}><option>Disponível</option><option>Em processo</option><option>Adotado</option><option>Indisponível</option></select></label>
                    <label><span>Nível de energia</span><select value={animalForm.energy || ""} onChange={(e) => updateAnimal("energy", e.target.value)}><option>Baixa</option><option>Baixa a moderada</option><option>Moderada</option><option>Alta</option></select></label>
                  </div>
                </div>

                <div className="admin-form-section">
                  <h3>Saúde e destaque</h3>
                  <div className="admin-check-grid">
                    {[['vaccinated','Vacinado'],['neutered','Castrado'],['dewormed','Vermifugado'],['specialNeeds','Necessidades especiais'],['featured','Destacar na Home']].map(([field,label]) => (
                      <label key={field}><input type="checkbox" checked={!!animalForm[field]} onChange={(e) => updateAnimal(field, e.target.checked)} /><span>{label}</span></label>
                    ))}
                  </div>
                </div>

                <div className="admin-form-section">
                  <h3>Perfil e comportamento</h3>
                  <div className="admin-fields-grid">
                    <div className="span-2 admin-preset-field">
                      <div><span>Temperamento</span><strong>{temperamentText || "Nenhuma opção selecionada"}</strong></div>
                      <button type="button" onClick={() => openAnimalSelection("temperament")}>{temperamentText ? "Alterar" : "Selecionar"}</button>
                    </div>
                    <div className="admin-preset-field">
                      <div><span>Convive com cães</span><strong>{animalForm.compatibility.dogs || "Nenhuma opção selecionada"}</strong></div>
                      <button type="button" onClick={() => openAnimalSelection("compatibilityDogs")}>{animalForm.compatibility.dogs ? "Alterar" : "Selecionar"}</button>
                    </div>
                    <div className="admin-preset-field">
                      <div><span>Convive com gatos</span><strong>{animalForm.compatibility.cats || "Nenhuma opção selecionada"}</strong></div>
                      <button type="button" onClick={() => openAnimalSelection("compatibilityCats")}>{animalForm.compatibility.cats ? "Alterar" : "Selecionar"}</button>
                    </div>
                    <div className="span-2 admin-preset-field">
                      <div><span>Convive com crianças</span><strong>{animalForm.compatibility.children || "Nenhuma opção selecionada"}</strong></div>
                      <button type="button" onClick={() => openAnimalSelection("compatibilityChildren")}>{animalForm.compatibility.children ? "Alterar" : "Selecionar"}</button>
                    </div>
                    <div className="span-2 admin-preset-field">
                      <div><span>Resumo do card</span><strong>{animalForm.summary || "Nenhuma opção selecionada"}</strong></div>
                      <button type="button" onClick={() => openAnimalSelection("summary")}>{animalForm.summary ? "Alterar" : "Selecionar"}</button>
                    </div>
                    <div className="span-2 admin-preset-field large">
                      <div><span>História completa</span><strong>{animalForm.story || "Nenhuma opção selecionada"}</strong></div>
                      <button type="button" onClick={() => openAnimalSelection("story")}>{animalForm.story ? "Alterar" : "Selecionar"}</button>
                    </div>
                    <div className="span-2 admin-preset-field">
                      <div><span>Lar ideal</span><strong>{animalForm.idealHome || "Nenhuma opção selecionada"}</strong></div>
                      <button type="button" onClick={() => openAnimalSelection("idealHome")}>{animalForm.idealHome ? "Alterar" : "Selecionar"}</button>
                    </div>
                    <label className="span-2"><span>Observações</span><textarea value={animalForm.observations} onChange={(e) => updateAnimal("observations", e.target.value)} /></label>
                  </div>
                </div>

                <div className="admin-form-footer"><button type="button" className="button secondary" onClick={() => setEditing(null)}>Cancelar</button><button className="button primary" type="submit" disabled={savingPhoto}>{editing === "new" ? "Cadastrar animal" : "Salvar alterações"}</button></div>
              </form>
            )}
          </div>
        )}



        {tab === "veterinarians" && (
          <div className="admin-content">
            {editingVet ? (
              <form className="admin-vet-editor" onSubmit={saveVeterinarian}>
                <div className="admin-editor-head">
                  <div>
                    <span>EQUIPE VETERINÁRIA</span>
                    <h2>{editingVet === "new" ? "Cadastrar veterinário" : `Editar ${vetForm.name}`}</h2>
                    <p>Defina apresentação, especialidades, visibilidade e exatamente em quais unidades este profissional atende.</p>
                  </div>
                  <button type="button" className="button secondary" onClick={() => setEditingVet(null)}>
                    Voltar
                  </button>
                </div>

                <div className="admin-vet-form-grid">
                  <section className="admin-vet-image-panel">
                    <span>APRESENTAÇÃO</span>
                    <label className="admin-vet-image-upload">
                      {vetForm.image ? (
                        <img src={vetForm.image} alt={vetForm.name || "Apresentação"} />
                      ) : (
                        <div>
                          <b>＋</b>
                          <strong>Adicionar imagem</strong>
                          <small>Arte de apresentação do profissional</small>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => uploadVeterinarianImage(e.target.files?.[0])}
                      />
                    </label>
                    <small>{savingVetImage ? "Enviando para o Cloudinary..." : "Clique na imagem para trocar."}</small>
                  </section>

                  <section className="admin-vet-fields">
                    <div className="cms-field-grid">
                      <label className="span-2">
                        <span>Nome *</span>
                        <input value={vetForm.name} onChange={(e) => updateVet("name", e.target.value)} placeholder="Ex.: Dra. Bruna" />
                      </label>
                      <label>
                        <span>Função / título</span>
                        <input value={vetForm.role} onChange={(e) => updateVet("role", e.target.value)} placeholder="Clínica Geral e Medicina Felina" />
                      </label>
                      <label>
                        <span>CRMV</span>
                        <input value={vetForm.crmv || ""} onChange={(e) => updateVet("crmv", e.target.value)} placeholder="CRMV-RS 00000" />
                      </label>
                      <label>
                        <span>Ano de formação</span>
                        <input inputMode="numeric" maxLength={4} value={vetForm.graduation || ""} onChange={(e) => updateVet("graduation", maskYear(e.target.value))} placeholder="2021" />
                      </label>
                      <label>
                        <span>Ordem de exibição</span>
                        <input type="number" min="1" value={vetForm.order || 1} onChange={(e) => updateVet("order", e.target.value)} />
                      </label>
                      <label className="span-2">
                        <span>Especialidades / categorias</span>
                        <input value={vetCategoriesText} onChange={(e) => setVetCategoriesText(e.target.value)} placeholder="Clínica Geral, Cirurgia, Felinos" />
                        <small>Separe por vírgulas. Estes itens também viram filtros na página pública.</small>
                      </label>
                      <label className="span-2">
                        <span>Destaque profissional</span>
                        <input value={vetForm.highlight} onChange={(e) => updateVet("highlight", e.target.value)} placeholder="Ex.: Especialista em felinos" />
                      </label>
                      <label className="span-2">
                        <span>Resumo</span>
                        <textarea value={vetForm.summary} onChange={(e) => updateVet("summary", e.target.value)} placeholder="Texto curto apresentado no perfil do profissional." />
                      </label>
                    </div>

                    <div className="admin-vet-units">
                      <div className="admin-vet-units-head">
                        <div>
                          <span>UNIDADES DE ATENDIMENTO</span>
                          <h3>Onde este veterinário atende?</h3>
                          <p>O cliente verá no agendamento somente as unidades marcadas aqui.</p>
                        </div>
                      </div>

                      <div className="admin-vet-unit-options">
                        {["Gravataí", "Cachoeirinha"].map((unit) => (
                          <label className={(vetForm.units || []).includes(unit) ? "selected" : ""} key={unit}>
                            <input
                              type="checkbox"
                              checked={(vetForm.units || []).includes(unit)}
                              onChange={() => toggleVetUnit(unit)}
                            />
                            <div>
                              <strong>{unit}</strong>
                              <span>
                                {(vetForm.units || []).includes(unit)
                                  ? "Esta unidade aparecerá para o cliente."
                                  : "Esta unidade ficará escondida no agendamento."}
                              </span>
                            </div>
                            <b>{(vetForm.units || []).includes(unit) ? "✓" : "＋"}</b>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="cms-switch-list large admin-vet-switches">
                      <label className="cms-switch-row">
                        <div><strong>Profissional ativo no site</strong><span>Quando desligado, some da página pública sem apagar o cadastro.</span></div>
                        <input type="checkbox" checked={vetForm.active !== false} onChange={(e) => updateVet("active", e.target.checked)} />
                      </label>
                      <label className="cms-switch-row">
                        <div><strong>Permitir agendamento pelo site</strong><span>Quando desligado, o perfil continua visível, mas sem botão de agendar.</span></div>
                        <input type="checkbox" checked={vetForm.scheduleEnabled !== false} onChange={(e) => updateVet("scheduleEnabled", e.target.checked)} />
                      </label>
                    </div>

                    {vetForm.scheduleEnabled !== false && !(vetForm.units || []).length && (
                      <div className="cms-note warning">
                        <strong>Atenção</strong>
                        <p>O agendamento está ligado, mas nenhuma unidade foi marcada. O botão de agendar ficará oculto até escolher pelo menos uma unidade.</p>
                      </div>
                    )}

                    <div className="admin-editor-actions">
                      <button type="button" className="button secondary" onClick={() => setEditingVet(null)}>Cancelar</button>
                      <button className="button primary" type="submit" disabled={savingVetImage}>
                        {editingVet === "new" ? "Cadastrar veterinário" : "Salvar alterações"}
                      </button>
                    </div>
                  </section>
                </div>
              </form>
            ) : (
              <>
                <section className="admin-vets-page-settings">
                  <div className="admin-vets-page-settings-head">
                    <div>
                      <span>PÁGINA PÚBLICA</span>
                      <h2>Textos da página Veterinários</h2>
                      <p>Controle também os textos do banner e da apresentação da equipe sem editar código.</p>
                    </div>
                    <a className="button secondary" href="/veterinarios" target="_blank" rel="noreferrer">↗ Ver página</a>
                  </div>

                  <div className="cms-field-grid">
                    <label><span>Texto pequeno do banner</span><input value={settings.vetsPageEyebrow || ""} onChange={(e) => updateSetting("vetsPageEyebrow", e.target.value)} /></label>
                    <label className="span-2"><span>Título do banner</span><input value={settings.vetsPageTitle || ""} onChange={(e) => updateSetting("vetsPageTitle", e.target.value)} /></label>
                    <label className="span-2"><span>Descrição do banner</span><textarea value={settings.vetsPageText || ""} onChange={(e) => updateSetting("vetsPageText", e.target.value)} /></label>
                    <label><span>Texto pequeno da seção</span><input value={settings.vetsIntroEyebrow || ""} onChange={(e) => updateSetting("vetsIntroEyebrow", e.target.value)} /></label>
                    <label className="span-2"><span>Título da seção</span><input value={settings.vetsIntroTitle || ""} onChange={(e) => updateSetting("vetsIntroTitle", e.target.value)} /></label>
                    <label className="span-2"><span>Texto da seção</span><textarea value={settings.vetsIntroText || ""} onChange={(e) => updateSetting("vetsIntroText", e.target.value)} /></label>
                  </div>

                  <div className="admin-vets-page-save">
                    <button type="button" className="button primary" onClick={saveVeterinarianPageSettings}>
                      Salvar textos da página
                    </button>
                  </div>
                </section>

                <section className="admin-vets-manager">
                  <div className="admin-card-heading">
                    <div><span>EQUIPE</span><h2>Profissionais cadastrados</h2></div>
                    <small>{veterinarians.filter((item) => item.active !== false).length} ativos</small>
                  </div>

                  <div className="admin-vets-list">
                    {[...veterinarians]
                      .sort((a, b) => Number(a.order || 999) - Number(b.order || 999))
                      .map((vet) => (
                        <article className={vet.active === false ? "admin-vet-row inactive" : "admin-vet-row"} key={vet.slug}>
                          <img src={vet.image} alt={vet.name} />
                          <div className="admin-vet-row-main">
                            <div>
                              <span>#{Number(vet.order || 1)}</span>
                              <h3>{vet.name}</h3>
                              <small>{vet.role || "Sem função informada"}{vet.crmv ? ` • ${vet.crmv}` : ""}</small>
                            </div>
                            <div className="admin-vet-row-tags">
                              {(vet.units || []).map((unit) => <span key={unit}>{unit}</span>)}
                              {vet.active === false && <span className="off">Oculto</span>}
                              {vet.scheduleEnabled === false && <span className="off">Sem agendamento</span>}
                              {vet.scheduleEnabled !== false && !(vet.units || []).length && <span className="warning">Sem unidade</span>}
                            </div>
                          </div>

                          <div className="admin-vet-row-actions">
                            <button type="button" onClick={() => beginEditVeterinarian(vet)}>Editar</button>
                            {deleteVetSlug === vet.slug ? (
                              <>
                                <button type="button" className="danger" onClick={() => removeVeterinarian(vet.slug)}>Confirmar</button>
                                <button type="button" onClick={() => setDeleteVetSlug(null)}>Cancelar</button>
                              </>
                            ) : (
                              <button type="button" className="danger-text" onClick={() => setDeleteVetSlug(vet.slug)}>Excluir</button>
                            )}
                          </div>
                        </article>
                      ))}
                  </div>

                  {!veterinarians.length && (
                    <div className="admin-empty big">Nenhum veterinário cadastrado.</div>
                  )}
                </section>
              </>
            )}
          </div>
        )}

        {tab === "stories" && (
          <div className="admin-content">
            <div className="admin-stories-head">
              <div>
                <span>ADOÇÕES CONCLUÍDAS</span>
                <h2>Histórias publicadas</h2>
                <p>
                  Cada história criada ao concluir uma adoção aparece imediatamente
                  na página pública “Histórias”.
                </p>
              </div>
              <a className="button secondary" href="/historias" target="_blank" rel="noreferrer">
                ↗ Ver no site
              </a>
            </div>

            <div className="admin-stories-grid">
              {stories.map((story) => (
                <article className="admin-story-card" key={story.id}>
                  <img src={story.photo} alt={story.animalName} />
                  <div>
                    <span>FINAL FELIZ</span>
                    <h3>{story.title}</h3>
                    <small>
                      {story.animalName}
                      {story.adoptionDate
                        ? ` • ${new Date(`${story.adoptionDate}T12:00:00`).toLocaleDateString("pt-BR")}`
                        : ""}
                    </small>
                    <p>{story.story}</p>
                    <div className="admin-story-card-footer">
                      <div>
                        {story.familyName && <strong>Família: {story.familyName}</strong>}
                        {story.familyCity && <span>{story.familyCity}</span>}
                      </div>
                      <button type="button" className="danger" onClick={() => deleteStory(story.id)}>
                        Excluir história
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {!stories.length && (
                <div className="admin-empty big admin-stories-empty">
                  Nenhuma história publicada ainda. Vá em Animais e clique em
                  “Concluir adoção”.
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "applications" && (
          <div className="admin-content">
            <div className="admin-applications-layout">
              <div className="admin-application-list">
                {applications.map((item) => (
                  <button key={item.id} className={selectedApplication?.id === item.id ? "active" : ""} onClick={() => setSelectedApplication(item)}>
                    <div><strong>{item.applicant?.fullName || "Sem nome"}</strong><span>{item.animalName} • {new Date(item.createdAt).toLocaleDateString("pt-BR")}</span></div>
                    <span className={`admin-status status-${item.status}`}>{applicationStatusLabels[item.status] || item.status}</span>
                  </button>
                ))}
                {!applications.length && <div className="admin-empty big">Nenhuma solicitação enviada neste navegador.</div>}
              </div>

              <div className="admin-application-detail">
                {!selectedApplication ? <div className="admin-empty big">Selecione uma solicitação para analisar.</div> : (
                  <>
                    <div className="admin-app-detail-head"><div><span>{selectedApplication.id}</span><h2>{selectedApplication.applicant?.fullName}</h2><p>Interesse em <b>{selectedApplication.animalName}</b></p></div><select value={selectedApplication.status} onChange={(e) => updateApplication(selectedApplication.id, { status: e.target.value })}>{Object.entries(applicationStatusLabels).map(([value,label]) => <option value={value} key={value}>{label}</option>)}</select></div>
                    <div className="admin-applicant-contact"><a href={`tel:${selectedApplication.applicant?.whatsapp || ''}`}>{selectedApplication.applicant?.whatsapp ? maskBrazilPhone(selectedApplication.applicant.whatsapp) : "Sem telefone"}</a><span>{selectedApplication.applicant?.email || "Sem e-mail"}</span><span>{selectedApplication.applicant?.city || ""} • {selectedApplication.applicant?.neighborhood || ""}</span></div>
                    <div className="admin-answer-grid">
                      {[
                        ["Idade", selectedApplication.applicant?.age],
                        ["Moradia", `${selectedApplication.applicant?.housingType || ''} • ${selectedApplication.applicant?.housingOwnership || ''}`],
                        ["Animais permitidos", selectedApplication.applicant?.petsAllowed],
                        ["Casa protegida", selectedApplication.applicant?.protectedHome],
                        ["Adultos", selectedApplication.applicant?.adults],
                        ["Crianças", selectedApplication.applicant?.children === 'Sim' ? `Sim • ${selectedApplication.applicant?.childrenAges || ''}` : selectedApplication.applicant?.children],
                        ["Outros animais", selectedApplication.applicant?.otherPets === 'Sim' ? selectedApplication.applicant?.otherPetsDetails : selectedApplication.applicant?.otherPets],
                        ["Tempo sozinho", selectedApplication.applicant?.hoursAlone],
                        ["Experiência", selectedApplication.applicant?.previousExperience],
                        ["Todos concordam", selectedApplication.applicant?.householdAgreement],
                        ["Compromisso financeiro", selectedApplication.applicant?.financialCommitment],
                        ["Adaptação", selectedApplication.applicant?.adaptationCommitment],
                      ].map(([label,value]) => <div key={label}><small>{label}</small><strong>{value || "—"}</strong></div>)}
                    </div>
                    {(() => {
                      const photos = selectedApplication.applicant?.housingPhotos || {};
                      const groups = [
                        ["windows", "Janelas / telas"],
                        ["patio", "Pátio / área externa"],
                      ].filter(([key]) => Array.isArray(photos[key]) && photos[key].length);

                      if (!groups.length) return null;

                      return (
                        <div className="admin-application-photos">
                          <div className="admin-application-photos-head">
                            <small>FOTOS DA MORADIA</small>
                            <strong>Verificação de segurança</strong>
                          </div>
                          {groups.map(([key, label]) => (
                            <div className="admin-application-photo-group" key={key}>
                              <span>{label}</span>
                              <div>
                                {photos[key].map((url, index) => (
                                  <a href={url} target="_blank" rel="noreferrer" key={`${key}-${index}`}>
                                    <img src={url} alt={`${label} ${index + 1}`} />
                                    <small>Foto {index + 1} ↗</small>
                                  </a>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                    <div className="admin-long-answer"><small>Onde o animal ficará</small><p>{selectedApplication.applicant?.petStay || "—"}</p></div>
                    <div className="admin-long-answer"><small>Motivo da adoção</small><p>{selectedApplication.applicant?.adoptionReason || "—"}</p></div>
                    <div className="admin-long-answer"><small>Observações do candidato</small><p>{selectedApplication.applicant?.observations || "—"}</p></div>
                    <label className="admin-notes"><span>Observação interna da equipe</span><textarea value={selectedApplication.internalNotes || ""} onChange={(e) => setSelectedApplication({ ...selectedApplication, internalNotes: e.target.value })} placeholder="Ex.: liguei dia 13/08, aguardar retorno..." /><button className="button primary" type="button" onClick={() => updateApplication(selectedApplication.id, { internalNotes: selectedApplication.internalNotes || "" })}>Salvar observação</button></label>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "feedback" && (
          <div className="admin-content">
            <div className="admin-feedback-summary"><Metric label="Média" value={metrics.average} detail="nota de 1 a 5" /><Metric label="Respostas" value={feedback.length} detail="avaliações recebidas" /><Metric label="Encontraram" value={feedback.filter((item) => item.foundWhatNeeded === "Sim").length} detail="responderam sim" /></div>
            <div className="admin-feedback-list">
              {feedback.slice().reverse().map((item, index) => <article key={`${item.createdAt}-${index}`}><div><strong>{item.rating}/5</strong><span>{item.foundWhatNeeded || "—"}</span><small>{item.createdAt ? new Date(item.createdAt).toLocaleString("pt-BR") : ""}</small></div><p>{item.comment || "Sem comentário."}</p></article>)}
              {!feedback.length && <div className="admin-empty big">Nenhuma avaliação do site neste navegador.</div>}
            </div>
          </div>
        )}


        {tab === "connect" && (
          <div className="admin-content">
            <div className="admin-connect-top">
              <div>
                <span>FORGE CONNECT</span>
                <h2>Atendimento do site</h2>
                <p>Conversas iniciadas pelos visitantes do portal Onda Animal.</p>
              </div>
              <div className="admin-connect-kpis">
                <div>
                  <strong>{(connect.conversations || []).filter((item) => item.status !== "ENCERRADA").length}</strong>
                  <span>Abertas</span>
                </div>
                <div>
                  <strong>{(connect.conversations || []).filter((item) => (item.messages || []).some((m) => m.from === "client" && !m.readBySupport)).length}</strong>
                  <span>Não lidas</span>
                </div>
              </div>
            </div>

            <div className="admin-connect-layout">
              <aside className="admin-connect-list">
                <div className="admin-connect-list-head">
                  <strong>Conversas</strong>
                  <span>{(connect.conversations || []).length}</span>
                </div>

                {(connect.conversations || []).map((conversation) => {
                  const last = (conversation.messages || []).at(-1);
                  const unreadConversation = (conversation.messages || []).some(
                    (m) => m.from === "client" && !m.readBySupport
                  );

                  return (
                    <button
                      type="button"
                      key={conversation.id}
                      className={`${selectedConversationId === conversation.id ? "active" : ""} ${unreadConversation ? "unread" : ""}`}
                      onClick={() => selectConnectConversation(conversation.id)}
                    >
                      <span className="admin-connect-avatar">
                        {(conversation.visitor?.name || "V").charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <strong>{conversation.visitor?.name || "Visitante"}</strong>
                        <small>{conversation.topic || "Sem assunto"}</small>
                        <p>{last?.text || "Conversa iniciada"}</p>
                      </div>
                      {unreadConversation && <i />}
                    </button>
                  );
                })}

                {!(connect.conversations || []).length && (
                  <div className="admin-empty big">Nenhuma conversa iniciada ainda.</div>
                )}
              </aside>

              <section className="admin-connect-chat">
                {(() => {
                  const selected = (connect.conversations || []).find(
                    (item) => item.id === selectedConversationId
                  );

                  if (!selected) {
                    return <div className="admin-empty big">Selecione uma conversa.</div>;
                  }

                  return (
                    <>
                      <header className="admin-connect-chat-head">
                        <div>
                          <strong>{selected.visitor?.name || "Visitante"}</strong>
                          <span>
                            {selected.visitor?.whatsapp ? maskBrazilPhone(selected.visitor.whatsapp) : "Sem WhatsApp"} •{" "}
                            {selected.topic || "Sem assunto"}
                          </span>
                        </div>

                        <div className="admin-connect-head-actions">
                          <span className={selected.status === "ENCERRADA" ? "closed" : "open"}>
                            {selected.status === "ENCERRADA" ? "Encerrada" : "Aberta"}
                          </span>
                          <button type="button" onClick={() => toggleConnectStatus(selected.id)}>
                            {selected.status === "ENCERRADA" ? "Reabrir" : "Encerrar"}
                          </button>
                        </div>
                      </header>

                      <div className="admin-connect-context">
                        <span>Origem: <b>{selected.site || "Onda Animal"}</b></span>
                        <span>Página: <b>{selected.page || "/"}</b></span>
                        <span>
                          Iniciada em:{" "}
                          <b>
                            {selected.createdAt
                              ? new Date(selected.createdAt).toLocaleString("pt-BR")
                              : "—"}
                          </b>
                        </span>
                      </div>

                      <div className="admin-connect-thread">
                        {(selected.messages || []).map((msg) => (
                          <div
                            className={`admin-connect-message ${msg.from === "support" ? "support" : "client"}`}
                            key={msg.id}
                          >
                            <p>{msg.text}</p>
                            <small>
                              {msg.from === "support"
                                ? "Onda Animal"
                                : selected.visitor?.name || "Visitante"}{" "}
                              •{" "}
                              {msg.date
                                ? new Date(msg.date).toLocaleString("pt-BR", {
                                    dateStyle: "short",
                                    timeStyle: "short",
                                  })
                                : ""}
                            </small>
                          </div>
                        ))}
                      </div>

                      <form className="admin-connect-reply" onSubmit={replyForgeConnect}>
                        <input
                          value={connectReply}
                          onChange={(e) => setConnectReply(e.target.value)}
                          placeholder="Responder pelo Forge Connect..."
                        />
                        <button type="submit">Enviar</button>
                      </form>
                    </>
                  );
                })()}
              </section>
            </div>

            <div className="admin-connect-local-note">
              <strong>Modo local de desenvolvimento</strong>
              <p>
                Nesta versão, as mensagens ficam salvas neste site. Para o Forge
                Connect central receber conversas de diferentes dispositivos e
                domínios, vamos conectar o módulo a uma API compartilhada no Neon.
              </p>
            </div>
          </div>
        )}

        {tab === "settings" && (
          <div className="admin-content">
            <form className="cms-settings-shell" onSubmit={saveAdminSettings}>
              <div className="cms-settings-intro">
                <div>
                  <span>PERSONALIZAÇÃO COMPLETA</span>
                  <h2>Configurações do site</h2>
                  <p>
                    Altere identidade visual, banner, textos, menu, módulos, contatos,
                    SEO e funcionamento do portal sem editar código.
                  </p>
                </div>

                <div className="cms-settings-actions">
                  <a className="button secondary" href="/" target="_blank" rel="noreferrer">
                    ↗ Visualizar site
                  </a>
                  <button className="button primary" type="submit">
                    Salvar alterações
                  </button>
                </div>
              </div>

              <div className="cms-settings-layout">
                <aside className="cms-settings-nav">
                  {[
                    ["visual", "◉", "Identidade visual"],
                    ["header", "☰", "Cabeçalho e menu"],
                    ["home", "▣", "Home e banner"],
                    ["adoption", "♡", "Adoção"],
                    ["animal-form", "✎", "Cadastro de animais"],
                    ["contact", "☎", "Contatos"],
                    ["footer", "▤", "Rodapé"],
                    ["modules", "⚡", "Módulos"],
                    ["seo", "⌕", "SEO"],
                    ["security", "⚙", "Segurança e backup"],
                    ["advanced", "</>", "Avançado"],
                  ].map(([key, icon, label]) => (
                    <button
                      type="button"
                      key={key}
                      className={settingsSection === key ? "active" : ""}
                      onClick={() => setSettingsSection(key)}
                    >
                      <i>{icon}</i><span>{label}</span>
                    </button>
                  ))}
                </aside>

                <div className="cms-settings-content">
                  {settingsSection === "visual" && (
                    <section className="cms-config-section">
                      <div className="cms-config-heading">
                        <span>IDENTIDADE VISUAL</span>
                        <h3>Marca, cores e aparência</h3>
                        <p>Essas opções alteram a identidade visual em todo o site.</p>
                      </div>

                      <div className="cms-brand-upload-grid">
                        <label className="cms-image-setting">
                          <span>Logotipo</span>
                          <div className="cms-image-preview logo-preview">
                            <img src={settings.logo || "/logo.png"} alt="Logo atual" />
                          </div>
                          <strong>{savingSettingImage === "logo" ? "Enviando..." : "Trocar logo"}</strong>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={(e) => readSettingImage(e.target.files?.[0], "logo")}
                          />
                        </label>

                        <label className="cms-image-setting">
                          <span>Favicon / ícone</span>
                          <div className="cms-image-preview favicon-preview">
                            <img src={settings.favicon || settings.logo || "/logo.png"} alt="Favicon atual" />
                          </div>
                          <strong>{savingSettingImage === "favicon" ? "Enviando..." : "Trocar ícone"}</strong>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={(e) => readSettingImage(e.target.files?.[0], "favicon")}
                          />
                        </label>
                      </div>

                      <div className="cms-field-grid">
                        <label className="span-2">
                          <span>Nome da marca</span>
                          <input value={settings.siteName} onChange={(e) => updateSetting("siteName", e.target.value)} />
                        </label>
                        <label className="span-2">
                          <span>Subtítulo da marca</span>
                          <input value={settings.siteSubtitle} onChange={(e) => updateSetting("siteSubtitle", e.target.value)} />
                        </label>
                      </div>

                      <div className="cms-color-grid">
                        {[
                          ["primaryColor", "Cor principal"],
                          ["primaryDark", "Principal escura"],
                          ["primaryDeep", "Principal profunda"],
                          ["navyColor", "Títulos / azul escuro"],
                          ["accentColor", "Cor de destaque"],
                          ["backgroundColor", "Fundo geral"],
                          ["textColor", "Texto geral"],
                          ["headerBackground", "Fundo do cabeçalho"],
                          ["footerBackground", "Fundo do rodapé"],
                        ].map(([field, label]) => (
                          <label className="cms-color-field" key={field}>
                            <span>{label}</span>
                            <div>
                              <input
                                type="color"
                                value={settings[field]}
                                onChange={(e) => updateSetting(field, e.target.value)}
                              />
                              <input
                                value={settings[field]}
                                onChange={(e) => updateSetting(field, e.target.value)}
                              />
                            </div>
                          </label>
                        ))}
                      </div>

                      <div className="cms-field-grid">
                        <label>
                          <span>Arredondamento dos cards</span>
                          <div className="cms-range-row">
                            <input
                              type="range"
                              min="0"
                              max="40"
                              value={settings.borderRadius}
                              onChange={(e) => updateSetting("borderRadius", e.target.value)}
                            />
                            <b>{settings.borderRadius}px</b>
                          </div>
                        </label>

                        <label>
                          <span>Escala geral das fontes</span>
                          <div className="cms-range-row">
                            <input
                              type="range"
                              min="0.85"
                              max="1.2"
                              step="0.05"
                              value={settings.fontScale}
                              onChange={(e) => updateSetting("fontScale", e.target.value)}
                            />
                            <b>{Math.round(Number(settings.fontScale) * 100)}%</b>
                          </div>
                        </label>
                      </div>
                    </section>
                  )}

                  {settingsSection === "header" && (
                    <section className="cms-config-section">
                      <div className="cms-config-heading">
                        <span>CABEÇALHO E MENU</span>
                        <h3>Navegação e aviso superior</h3>
                      </div>

                      <div className="cms-switch-list">
                        {[
                          ["showMenuHome", "Mostrar Início"],
                          ["showMenuAnimals", "Mostrar Animais"],
                          ["showMenuHowAdopt", "Mostrar Como adotar"],
                          ["showMenuStories", "Mostrar Histórias"],
                          ["showMenuClinic", "Mostrar Clínica"],
                          ["showMenuVeterinarians", "Mostrar Veterinários"],
                          ["showMenuContact", "Mostrar Contato"],
                          ["showMenuFeedback", "Mostrar Avalie"],
                          ["showAdoptButton", "Mostrar botão Quero adotar"],
                          ["showAdminButton", "Mostrar botão Painel"],
                        ].map(([field, label]) => (
                          <label className="cms-switch-row" key={field}>
                            <div><strong>{label}</strong></div>
                            <input
                              type="checkbox"
                              checked={Boolean(settings[field])}
                              onChange={(e) => updateSetting(field, e.target.checked)}
                            />
                          </label>
                        ))}
                      </div>

                      <div className="cms-field-grid">
                        <label>
                          <span>Texto do botão de adoção</span>
                          <input value={settings.adoptButtonText} onChange={(e) => updateSetting("adoptButtonText", e.target.value)} />
                        </label>
                        <label>
                          <span>Texto do botão administrativo</span>
                          <input value={settings.adminButtonText} onChange={(e) => updateSetting("adminButtonText", e.target.value)} />
                        </label>
                      </div>

                      <div className="cms-subsection">
                        <div className="cms-subsection-title">
                          <h4>Aviso no topo</h4>
                          <label className="cms-inline-toggle">
                            <input
                              type="checkbox"
                              checked={settings.announcementEnabled}
                              onChange={(e) => updateSetting("announcementEnabled", e.target.checked)}
                            />
                            <span>Ativar</span>
                          </label>
                        </div>

                        <div className="cms-field-grid">
                          <label className="span-2">
                            <span>Mensagem</span>
                            <input value={settings.announcementText} onChange={(e) => updateSetting("announcementText", e.target.value)} />
                          </label>
                          <label>
                            <span>Texto do link</span>
                            <input value={settings.announcementButtonText} onChange={(e) => updateSetting("announcementButtonText", e.target.value)} />
                          </label>
                          <label>
                            <span>Destino do link</span>
                            <input value={settings.announcementButtonLink} onChange={(e) => updateSetting("announcementButtonLink", e.target.value)} />
                          </label>
                          <label>
                            <span>Cor de fundo</span>
                            <input type="color" value={settings.announcementBackground} onChange={(e) => updateSetting("announcementBackground", e.target.value)} />
                          </label>
                          <label>
                            <span>Cor do texto</span>
                            <input type="color" value={settings.announcementTextColor} onChange={(e) => updateSetting("announcementTextColor", e.target.value)} />
                          </label>
                        </div>
                      </div>
                    </section>
                  )}

                  {settingsSection === "home" && (
                    <section className="cms-config-section">
                      <div className="cms-config-heading">
                        <span>HOME E BANNER</span>
                        <h3>Página inicial</h3>
                        <p>Controle o banner principal e todas as seções da Home.</p>
                      </div>

                      <div className="cms-subsection">
                        <div className="cms-subsection-title">
                          <h4>Banner principal</h4>
                          <label className="cms-inline-toggle">
                            <input type="checkbox" checked={settings.heroEnabled} onChange={(e) => updateSetting("heroEnabled", e.target.checked)} />
                            <span>Mostrar</span>
                          </label>
                        </div>

                        <label className="cms-wide-image-setting">
                          <span>Imagem de fundo do banner</span>
                          <div className={settings.heroBannerImage ? "cms-banner-preview has-image" : "cms-banner-preview"}>
                            {settings.heroBannerImage
                              ? <img src={settings.heroBannerImage} alt="Banner atual" />
                              : <div><b>＋</b><strong>Adicionar banner</strong><small>Se vazio, continua usando os animais em destaque.</small></div>}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => readSettingImage(e.target.files?.[0], "heroBannerImage")}
                          />
                        </label>

                        {settings.heroBannerImage && (
                          <button type="button" className="cms-remove-image" onClick={() => updateSetting("heroBannerImage", "")}>
                            Remover banner e voltar aos animais
                          </button>
                        )}

                        <div className="cms-field-grid">
                          <label className="span-2"><span>Texto pequeno</span><input value={settings.heroEyebrow} onChange={(e) => updateSetting("heroEyebrow", e.target.value)} /></label>
                          <label className="span-2"><span>Título principal</span><textarea value={settings.heroTitle} onChange={(e) => updateSetting("heroTitle", e.target.value)} /></label>
                          <label className="span-2"><span>Descrição</span><textarea value={settings.heroText} onChange={(e) => updateSetting("heroText", e.target.value)} /></label>
                          <label><span>Botão principal</span><input value={settings.heroPrimaryText} onChange={(e) => updateSetting("heroPrimaryText", e.target.value)} /></label>
                          <label><span>Link principal</span><input value={settings.heroPrimaryLink} onChange={(e) => updateSetting("heroPrimaryLink", e.target.value)} /></label>
                          <label><span>Botão secundário</span><input value={settings.heroSecondaryText} onChange={(e) => updateSetting("heroSecondaryText", e.target.value)} /></label>
                          <label><span>Link secundário</span><input value={settings.heroSecondaryLink} onChange={(e) => updateSetting("heroSecondaryLink", e.target.value)} /></label>
                          <label><span>Selo 1</span><input value={settings.heroBadge1} onChange={(e) => updateSetting("heroBadge1", e.target.value)} /></label>
                          <label><span>Selo 2</span><input value={settings.heroBadge2} onChange={(e) => updateSetting("heroBadge2", e.target.value)} /></label>
                          <label><span>Selo 3</span><input value={settings.heroBadge3} onChange={(e) => updateSetting("heroBadge3", e.target.value)} /></label>
                          <label>
                            <span>Opacidade sobre a foto</span>
                            <div className="cms-range-row">
                              <input type="range" min="0" max="0.75" step="0.05" value={settings.heroOverlay} onChange={(e) => updateSetting("heroOverlay", e.target.value)} />
                              <b>{Math.round(Number(settings.heroOverlay) * 100)}%</b>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="cms-subsection">
                        <div className="cms-subsection-title">
                          <h4>Faixa das 4 etapas</h4>
                          <label className="cms-inline-toggle">
                            <input type="checkbox" checked={settings.stepsStripEnabled} onChange={(e) => updateSetting("stepsStripEnabled", e.target.checked)} />
                            <span>Mostrar</span>
                          </label>
                        </div>
                        <div className="cms-field-grid">
                          <label><span>Etapa 1</span><input value={settings.stripStep1} onChange={(e) => updateSetting("stripStep1", e.target.value)} /></label>
                          <label><span>Etapa 2</span><input value={settings.stripStep2} onChange={(e) => updateSetting("stripStep2", e.target.value)} /></label>
                          <label><span>Etapa 3</span><input value={settings.stripStep3} onChange={(e) => updateSetting("stripStep3", e.target.value)} /></label>
                          <label><span>Etapa 4</span><input value={settings.stripStep4} onChange={(e) => updateSetting("stripStep4", e.target.value)} /></label>
                        </div>
                      </div>

                      <div className="cms-subsection">
                        <div className="cms-subsection-title">
                          <h4>Animais em destaque</h4>
                          <label className="cms-inline-toggle">
                            <input type="checkbox" checked={settings.homeAnimalsEnabled} onChange={(e) => updateSetting("homeAnimalsEnabled", e.target.checked)} />
                            <span>Mostrar</span>
                          </label>
                        </div>
                        <div className="cms-field-grid">
                          <label><span>Texto pequeno</span><input value={settings.homeAnimalsEyebrow} onChange={(e) => updateSetting("homeAnimalsEyebrow", e.target.value)} /></label>
                          <label><span>Botão</span><input value={settings.homeAnimalsButtonText} onChange={(e) => updateSetting("homeAnimalsButtonText", e.target.value)} /></label>
                          <label className="span-2"><span>Título</span><input value={settings.homeAnimalsTitle} onChange={(e) => updateSetting("homeAnimalsTitle", e.target.value)} /></label>
                          <label className="span-2"><span>Texto</span><textarea value={settings.homeAnimalsText} onChange={(e) => updateSetting("homeAnimalsText", e.target.value)} /></label>
                        </div>
                      </div>

                      <div className="cms-subsection">
                        <div className="cms-subsection-title">
                          <h4>Bloco “Adoção consciente”</h4>
                          <label className="cms-inline-toggle">
                            <input type="checkbox" checked={settings.processEnabled} onChange={(e) => updateSetting("processEnabled", e.target.checked)} />
                            <span>Mostrar</span>
                          </label>
                        </div>
                        <div className="cms-field-grid">
                          <label><span>Texto pequeno</span><input value={settings.processEyebrow} onChange={(e) => updateSetting("processEyebrow", e.target.value)} /></label>
                          <label><span>Texto do link</span><input value={settings.processButtonText} onChange={(e) => updateSetting("processButtonText", e.target.value)} /></label>
                          <label className="span-2"><span>Título</span><input value={settings.processTitle} onChange={(e) => updateSetting("processTitle", e.target.value)} /></label>
                          <label className="span-2"><span>Descrição</span><textarea value={settings.processText} onChange={(e) => updateSetting("processText", e.target.value)} /></label>
                          {[1,2,3,4].map((number) => (
                            <div className="cms-step-editor" key={number}>
                              <b>{number}</b>
                              <label><span>Título</span><input value={settings[`processStep${number}Title`]} onChange={(e) => updateSetting(`processStep${number}Title`, e.target.value)} /></label>
                              <label><span>Texto</span><input value={settings[`processStep${number}Text`]} onChange={(e) => updateSetting(`processStep${number}Text`, e.target.value)} /></label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="cms-subsection">
                        <div className="cms-subsection-title">
                          <h4>Chamada da clínica</h4>
                          <label className="cms-inline-toggle">
                            <input type="checkbox" checked={settings.clinicCtaEnabled} onChange={(e) => updateSetting("clinicCtaEnabled", e.target.checked)} />
                            <span>Mostrar</span>
                          </label>
                        </div>
                        <div className="cms-field-grid">
                          <label><span>Texto pequeno</span><input value={settings.clinicCtaEyebrow} onChange={(e) => updateSetting("clinicCtaEyebrow", e.target.value)} /></label>
                          <label><span>Botão</span><input value={settings.clinicCtaButtonText} onChange={(e) => updateSetting("clinicCtaButtonText", e.target.value)} /></label>
                          <label className="span-2"><span>Título</span><input value={settings.clinicCtaTitle} onChange={(e) => updateSetting("clinicCtaTitle", e.target.value)} /></label>
                          <label className="span-2"><span>Descrição</span><textarea value={settings.clinicCtaText} onChange={(e) => updateSetting("clinicCtaText", e.target.value)} /></label>
                          <label className="span-2"><span>Link do botão</span><input value={settings.clinicCtaButtonLink} onChange={(e) => updateSetting("clinicCtaButtonLink", e.target.value)} /></label>
                        </div>
                      </div>
                    </section>
                  )}

                  {settingsSection === "adoption" && (
                    <section className="cms-config-section">
                      <div className="cms-config-heading">
                        <span>ADOÇÃO</span>
                        <h3>Contato e módulos da adoção</h3>
                      </div>

                      <div className="cms-field-grid">
                        <label>
                          <span>Responsável pelas adoções</span>
                          <input value={settings.adoptionContactName || "Luise"} onChange={(e) => updateSetting("adoptionContactName", e.target.value)} placeholder="Luise" />
                        </label>
                        <label>
                          <span>WhatsApp da Luise / adoções</span>
                          <input type="tel" inputMode="tel" value={maskBrazilPhone(settings.adoptionWhatsApp)} onChange={(e) => updateSetting("adoptionWhatsApp", maskBrazilPhone(e.target.value))} placeholder="(51) 99999-9999" maxLength={15} />
                        </label>
                        <label className="span-2">
                          <span>E-mail de adoção</span>
                          <input type="email" value={settings.adoptionEmail} onChange={(e) => updateSetting("adoptionEmail", e.target.value)} />
                        </label>
                      </div>

                      <div className="cms-note">
                        <strong>Botão do WhatsApp</strong>
                        <p>Depois de preencher o número acima, o site exibe “Falar com {settings.adoptionContactName || "Luise"} no WhatsApp” nos perfis dos animais e na área de contato.</p>
                      </div>

                      <div className="cms-switch-list">
                        <label className="cms-switch-row">
                          <div><strong>Histórias de adoção</strong><span>Exibe a área de finais felizes.</span></div>
                          <input type="checkbox" checked={settings.storiesEnabled} onChange={(e) => updateSetting("storiesEnabled", e.target.checked)} />
                        </label>
                      </div>

                      <div className="cms-note">
                        <strong>Cadastros dos animais</strong>
                        <p>
                          Fotos, ficha completa, status, solicitações e conclusão da adoção
                          continuam sendo gerenciados nas abas Animais, Solicitações e Histórias.
                        </p>
                      </div>
                    </section>
                  )}

                  {settingsSection === "animal-form" && (
                    <section className="cms-config-section">
                      <div className="cms-config-heading">
                        <span>CADASTRO DE ANIMAIS</span>
                        <h3>Opções dos modais de cadastro</h3>
                        <p>
                          Edite aqui as alternativas que aparecem ao cadastrar um animal.
                          As mudanças são salvas no Neon e passam a valer em qualquer dispositivo.
                        </p>
                      </div>

                      <div className="cms-note">
                        <strong>Como funciona</strong>
                        <p>
                          Você pode adicionar, editar, remover e mudar a ordem das alternativas.
                          O cadastro permite selecionar até <b>3 opções</b>. A alternativa
                          <b> “Outro”</b> é adicionada automaticamente em todos os modais e abre
                          um campo para texto livre.
                        </p>
                      </div>

                      <div className="cms-switch-list">
                        <label className="cms-switch-row">
                          <div>
                            <strong>Mostrar visualizações no perfil público</strong>
                            <span>Exibe o total de acessos nos cards e no perfil completo do animal.</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.showPublicAnimalViews !== false}
                            onChange={(e) => updateSetting("showPublicAnimalViews", e.target.checked)}
                          />
                        </label>
                      </div>

                      <div className="cms-animal-options-grid">
                        <CmsOptionEditor
                          title="Temperamento"
                          description="Perfil e comportamento principal do animal."
                          options={profileOptionsForCms("temperament")}
                          defaultOptions={DEFAULT_ANIMAL_PROFILE_OPTIONS.temperament}
                          onChange={(value) => updateAnimalProfileOptions("temperament", value)}
                        />

                        <CmsOptionEditor
                          title="Convive com cães"
                          description="Alternativas de convivência com cães."
                          options={profileOptionsForCms("compatibilityDogs")}
                          defaultOptions={DEFAULT_ANIMAL_PROFILE_OPTIONS.compatibilityDogs}
                          onChange={(value) => updateAnimalProfileOptions("compatibilityDogs", value)}
                        />

                        <CmsOptionEditor
                          title="Convive com gatos"
                          description="Alternativas de convivência com gatos."
                          options={profileOptionsForCms("compatibilityCats")}
                          defaultOptions={DEFAULT_ANIMAL_PROFILE_OPTIONS.compatibilityCats}
                          onChange={(value) => updateAnimalProfileOptions("compatibilityCats", value)}
                        />

                        <CmsOptionEditor
                          title="Convive com crianças"
                          description="Alternativas de convivência com crianças."
                          options={profileOptionsForCms("compatibilityChildren")}
                          defaultOptions={DEFAULT_ANIMAL_PROFILE_OPTIONS.compatibilityChildren}
                          onChange={(value) => updateAnimalProfileOptions("compatibilityChildren", value)}
                        />

                        <CmsOptionEditor
                          title="Resumo do card"
                          description="Frases curtas usadas nos cards públicos."
                          options={profileOptionsForCms("summary")}
                          defaultOptions={DEFAULT_ANIMAL_PROFILE_OPTIONS.summary}
                          onChange={(value) => updateAnimalProfileOptions("summary", value)}
                        />

                        <CmsOptionEditor
                          title="História completa"
                          description="Histórias pré-definidas disponíveis no cadastro."
                          options={profileOptionsForCms("story")}
                          defaultOptions={DEFAULT_ANIMAL_PROFILE_OPTIONS.story}
                          onChange={(value) => updateAnimalProfileOptions("story", value)}
                        />

                        <CmsOptionEditor
                          title="Lar ideal"
                          description="Características do lar indicado para o animal."
                          options={profileOptionsForCms("idealHome")}
                          defaultOptions={DEFAULT_ANIMAL_PROFILE_OPTIONS.idealHome}
                          onChange={(value) => updateAnimalProfileOptions("idealHome", value)}
                        />
                      </div>
                    </section>
                  )}

                  {settingsSection === "contact" && (
                    <section className="cms-config-section">
                      <div className="cms-config-heading">
                        <span>CONTATOS</span>
                        <h3>Telefones, endereços e redes</h3>
                      </div>

                      <div className="cms-field-grid">
                        <label><span>Telefone 1 exibido</span><input type="tel" inputMode="tel" value={maskBrazilPhone(settings.phone1)} onChange={(e) => updateSetting("phone1", maskBrazilPhone(e.target.value))} maxLength={15} /></label>
                        <label><span>Telefone 1 para link</span><input value={settings.phone1Raw} onChange={(e) => updateSetting("phone1Raw", e.target.value)} placeholder="+5551..." /></label>
                        <label><span>Telefone 2 exibido</span><input type="tel" inputMode="tel" value={maskBrazilPhone(settings.phone2)} onChange={(e) => updateSetting("phone2", maskBrazilPhone(e.target.value))} maxLength={15} /></label>
                        <label><span>Telefone 2 para link</span><input value={settings.phone2Raw} onChange={(e) => updateSetting("phone2Raw", e.target.value)} placeholder="+5551..." /></label>
                        <label><span>WhatsApp Gravataí</span><input type="tel" inputMode="tel" value={maskBrazilPhone(settings.gravataiWhatsApp || "")} onChange={(e) => updateSetting("gravataiWhatsApp", maskBrazilPhone(e.target.value))} placeholder="(51) 99999-9999" maxLength={15} /></label>
                        <label><span>WhatsApp Cachoeirinha</span><input type="tel" inputMode="tel" value={maskBrazilPhone(settings.cachoeirinhaWhatsApp || "")} onChange={(e) => updateSetting("cachoeirinhaWhatsApp", maskBrazilPhone(e.target.value))} placeholder="(51) 99999-9999" maxLength={15} /></label>
                        <label className="span-2"><span>E-mail geral</span><input type="email" value={settings.generalEmail} onChange={(e) => updateSetting("generalEmail", e.target.value)} /></label>
                        <label className="span-2"><span>Instagram (URL completa)</span><input value={settings.instagram} onChange={(e) => updateSetting("instagram", e.target.value)} placeholder="https://instagram.com/..." /></label>
                        <label className="span-2"><span>Facebook (URL completa)</span><input value={settings.facebook} onChange={(e) => updateSetting("facebook", e.target.value)} placeholder="https://facebook.com/..." /></label>
                        <label className="span-2"><span>Endereço Gravataí</span><input value={settings.gravataiAddress} onChange={(e) => updateSetting("gravataiAddress", e.target.value)} /></label>
                        <label className="span-2"><span>Endereço Cachoeirinha</span><input value={settings.cachoeirinhaAddress} onChange={(e) => updateSetting("cachoeirinhaAddress", e.target.value)} /></label>
                      </div>

                      <div className="cms-subsection">
                        <h4>Textos da página de contato</h4>
                        <div className="cms-field-grid">
                          <label><span>Texto pequeno</span><input value={settings.contactEyebrow} onChange={(e) => updateSetting("contactEyebrow", e.target.value)} /></label>
                          <label className="span-2"><span>Título</span><input value={settings.contactTitle} onChange={(e) => updateSetting("contactTitle", e.target.value)} /></label>
                          <label className="span-2"><span>Descrição</span><textarea value={settings.contactText} onChange={(e) => updateSetting("contactText", e.target.value)} /></label>
                          <label><span>Título adoção</span><input value={settings.contactAdoptionTitle} onChange={(e) => updateSetting("contactAdoptionTitle", e.target.value)} /></label>
                          <label><span>Título clínica</span><input value={settings.contactClinicTitle} onChange={(e) => updateSetting("contactClinicTitle", e.target.value)} /></label>
                          <label className="span-2"><span>Texto adoção</span><textarea value={settings.contactAdoptionText} onChange={(e) => updateSetting("contactAdoptionText", e.target.value)} /></label>
                          <label className="span-2"><span>Texto clínica</span><textarea value={settings.contactClinicText} onChange={(e) => updateSetting("contactClinicText", e.target.value)} /></label>
                        </div>
                      </div>
                    </section>
                  )}

                  {settingsSection === "footer" && (
                    <section className="cms-config-section">
                      <div className="cms-config-heading">
                        <span>RODAPÉ</span>
                        <h3>Conteúdo do rodapé</h3>
                      </div>

                      <div className="cms-field-grid">
                        <label className="span-2">
                          <span>Texto de copyright</span>
                          <input value={settings.footerText} onChange={(e) => updateSetting("footerText", e.target.value)} />
                        </label>
                      </div>

                      <div className="cms-switch-list">
                        {[
                          ["footerShowAnimals", "Link Animais"],
                          ["footerShowHowAdopt", "Link Como adotar"],
                          ["footerShowVeterinarians", "Link Veterinários"],
                          ["footerShowFeedback", "Link Avalie o site"],
                          ["footerShowContact", "Link Contato"],
                        ].map(([field, label]) => (
                          <label className="cms-switch-row" key={field}>
                            <div><strong>{label}</strong></div>
                            <input type="checkbox" checked={settings[field]} onChange={(e) => updateSetting(field, e.target.checked)} />
                          </label>
                        ))}
                      </div>
                    </section>
                  )}

                  {settingsSection === "modules" && (
                    <section className="cms-config-section">
                      <div className="cms-config-heading">
                        <span>MÓDULOS</span>
                        <h3>Ligar ou desligar funções</h3>
                      </div>

                      <div className="cms-switch-list large">
                        <label className="cms-switch-row">
                          <div><strong>Forge Connect</strong><span>Bolha de atendimento no site e chat no painel.</span></div>
                          <input type="checkbox" checked={settings.forgeConnectEnabled} onChange={(e) => updateSetting("forgeConnectEnabled", e.target.checked)} />
                        </label>
                        <label className="cms-switch-row">
                          <div><strong>Pesquisa de satisfação</strong><span>Permite receber avaliações do site.</span></div>
                          <input type="checkbox" checked={settings.feedbackEnabled} onChange={(e) => updateSetting("feedbackEnabled", e.target.checked)} />
                        </label>
                        <label className="cms-switch-row">
                          <div><strong>Botão flutuante “Avalie o site”</strong><span>Pode esconder o botão e manter a página ativa.</span></div>
                          <input type="checkbox" checked={settings.floatingFeedbackEnabled} onChange={(e) => updateSetting("floatingFeedbackEnabled", e.target.checked)} />
                        </label>
                        <label className="cms-switch-row maintenance-switch">
                          <div><strong>Modo manutenção</strong><span>Esconde todo o site público e mostra apenas um aviso.</span></div>
                          <input type="checkbox" checked={settings.maintenanceEnabled} onChange={(e) => updateSetting("maintenanceEnabled", e.target.checked)} />
                        </label>
                      </div>

                      <div className="cms-field-grid">
                        <label className="span-2"><span>Título da manutenção</span><input value={settings.maintenanceTitle} onChange={(e) => updateSetting("maintenanceTitle", e.target.value)} /></label>
                        <label className="span-2"><span>Mensagem da manutenção</span><textarea value={settings.maintenanceText} onChange={(e) => updateSetting("maintenanceText", e.target.value)} /></label>
                      </div>
                    </section>
                  )}

                  {settingsSection === "seo" && (
                    <section className="cms-config-section">
                      <div className="cms-config-heading">
                        <span>SEO E NAVEGADOR</span>
                        <h3>Como o site se apresenta</h3>
                        <p>Em modo local, título, descrição e favicon são atualizados no navegador.</p>
                      </div>

                      <div className="cms-field-grid">
                        <label className="span-2"><span>Título do site</span><input value={settings.seoTitle} onChange={(e) => updateSetting("seoTitle", e.target.value)} /></label>
                        <label className="span-2"><span>Descrição</span><textarea value={settings.seoDescription} onChange={(e) => updateSetting("seoDescription", e.target.value)} /></label>
                      </div>

                      <label className="cms-wide-image-setting social-image-setting">
                        <span>Imagem social / compartilhamento</span>
                        <div className={settings.socialImage ? "cms-banner-preview has-image" : "cms-banner-preview"}>
                          {settings.socialImage
                            ? <img src={settings.socialImage} alt="Imagem social" />
                            : <div><b>＋</b><strong>Adicionar imagem</strong><small>Ideal: 1200 × 630 px</small></div>}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => readSettingImage(e.target.files?.[0], "socialImage")}
                        />
                      </label>
                    </section>
                  )}

                  {settingsSection === "security" && (
                    <section className="cms-config-section">
                      <div className="cms-config-heading">
                        <span>SEGURANÇA E BACKUP</span>
                        <h3>Acesso e cópia das configurações</h3>
                      </div>

                      <div className="cms-note">
                        <strong>PIN administrativo</strong>
                        <p>
                          Em produção o PIN fica protegido no servidor. Para alterá-lo,
                          edite a variável <b>ADMIN_PIN</b> nas configurações do projeto no Vercel.
                        </p>
                      </div>

                      <div className="cms-backup-grid">
                        <article>
                          <span>↓</span>
                          <h4>Exportar configurações</h4>
                          <p>Baixa um JSON com todas as opções desta tela.</p>
                          <button type="button" className="button secondary" onClick={exportSiteSettings}>
                            Baixar backup
                          </button>
                        </article>

                        <label>
                          <span>↑</span>
                          <h4>Importar configurações</h4>
                          <p>Restaura as opções a partir de um arquivo exportado.</p>
                          <strong className="button secondary">Escolher arquivo</strong>
                          <input type="file" accept="application/json" onChange={(e) => importSiteSettings(e.target.files?.[0])} />
                        </label>

                        <article className="cloudinary-migration-card">
                          <span>☁</span>
                          <h4>Migrar imagens antigas</h4>
                          <p>Move para o Cloudinary fotos antigas que ainda estejam incorporadas no Neon em base64.</p>
                          <button
                            type="button"
                            className="button secondary"
                            onClick={migrateLegacyImages}
                            disabled={migratingLegacyImages}
                          >
                            {migratingLegacyImages ? "Migrando..." : "Migrar para Cloudinary"}
                          </button>
                        </article>

                        <article className="danger-zone">
                          <span>↺</span>
                          <h4>Restaurar visual padrão</h4>
                          <p>Volta a personalização para o padrão, mantendo os contatos de adoção.</p>
                          <button type="button" className="button secondary" onClick={resetSiteSettings}>
                            Restaurar padrão
                          </button>
                        </article>
                      </div>

                      <div className="admin-local-warning">
                        <strong>Produção com Neon</strong>
                        <p>
                          Animais, configurações, histórias, formulários, avaliações e
                          Forge Connect são sincronizados com o banco Neon e ficam disponíveis
                          nos computadores autorizados pelo painel.
                        </p>
                      </div>
                    </section>
                  )}

                  {settingsSection === "advanced" && (
                    <section className="cms-config-section">
                      <div className="cms-config-heading">
                        <span>AVANÇADO</span>
                        <h3>CSS personalizado</h3>
                        <p>Use apenas se quiser fazer algum ajuste visual que ainda não exista nas opções acima.</p>
                      </div>

                      <label className="cms-code-field">
                        <span>CSS adicional</span>
                        <textarea
                          value={settings.customCss}
                          onChange={(e) => updateSetting("customCss", e.target.value)}
                          placeholder={".meu-elemento {\n  /* seu CSS */\n}"}
                          spellCheck="false"
                        />
                      </label>

                      <div className="cms-note warning">
                        <strong>Atenção</strong>
                        <p>Um CSS incorreto pode alterar o layout. Se algo ficar ruim, apague este campo ou use “Restaurar visual padrão”.</p>
                      </div>
                    </section>
                  )}
                </div>
              </div>

              <div className="cms-sticky-save">
                <div>
                  <strong>Configurações do site</strong>
                  <span>Salve para publicar as alterações no Neon. Imagens novas ficam no Cloudinary.</span>
                </div>
                <button className="button primary" type="submit">Salvar alterações</button>
              </div>
            </form>
          </div>
        )}
      </section>


{animalSelectionModal && (
  <div
    className="admin-preset-modal-backdrop"
    onMouseDown={(event) => {
      if (event.currentTarget === event.target) {
        closeAnimalSelection();
      }
    }}
  >
    <section className="admin-preset-modal" role="dialog" aria-modal="true" aria-label={animalSelectionModal.title}>
      <header className="admin-preset-modal-head">
        <div>
          <span>{animalSelectionModal.eyebrow}</span>
          <h2>{animalSelectionModal.title}</h2>
          <p>{animalSelectionModal.description}</p>
          <small className="admin-preset-limit">Selecione até 3 opções.</small>
        </div>
        <button
          type="button"
          onClick={() => {
            closeAnimalSelection();
          }}
        >
          ×
        </button>
      </header>

      <div className="admin-preset-modal-body">
        <div className="admin-preset-option-list">
          {animalSelectionModal.options.map((option, index) => {
            const checked = animalSelectionDraft.includes(option);
            const blocked = !checked && animalSelectionDraft.length >= 3;
            return (
              <label
                className={`${checked ? "admin-preset-option selected" : "admin-preset-option"}${blocked ? " disabled" : ""}`}
                key={`${index}-${option}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={blocked}
                  onChange={() => toggleAnimalSelectionOption(option)}
                />
                <span className="admin-preset-check">{checked ? "✓" : ""}</span>
                <strong>{option}{option === OTHER_OPTION ? " — digitar manualmente" : ""}</strong>
              </label>
            );
          })}
        </div>
      </div>

      <footer className="admin-preset-modal-footer">
        <div className="admin-preset-footer-left">
          <button type="button" className="button secondary" onClick={clearAnimalSelection}>
            Limpar
          </button>
          <strong>{animalSelectionDraft.length}/3 selecionadas</strong>
        </div>
        <div>
          <button
            type="button"
            className="button secondary"
            onClick={closeAnimalSelection}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="button primary"
            onClick={applyAnimalSelection}
            disabled={!animalSelectionDraft.length}
          >
            {animalSelectionDraft.length === 1 ? "Usar opção" : "Usar opções"}
          </button>
        </div>
      </footer>
    </section>
  </div>
)}


      {animalCustomModal && (
        <div
          className="admin-preset-modal-backdrop"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) closeCustomAnimalSelection();
          }}
        >
          <section
            className="admin-preset-modal admin-custom-option-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Outra opção para ${animalCustomModal.title}`}
          >
            <header className="admin-preset-modal-head">
              <div>
                <span>{animalCustomModal.eyebrow}</span>
                <h2>Outra opção</h2>
                <p>Digite como você quer que apareça em “{animalCustomModal.title}”.</p>
              </div>
              <button type="button" onClick={closeCustomAnimalSelection}>×</button>
            </header>

            <div className="admin-preset-modal-body">
              <label className="admin-custom-option-field">
                <span>Texto personalizado</span>
                <textarea
                  autoFocus
                  value={animalCustomDraft}
                  onChange={(event) => setAnimalCustomDraft(event.target.value)}
                  placeholder="Digite a opção personalizada..."
                  rows={5}
                />
              </label>
            </div>

            <footer className="admin-preset-modal-footer">
              <span />
              <div>
                <button type="button" className="button secondary" onClick={closeCustomAnimalSelection}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="button primary"
                  disabled={!animalCustomDraft.trim()}
                  onClick={applyCustomAnimalSelection}
                >
                  Usar este texto
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}

      {adoptionAnimal && (
        <div
          className="admin-adoption-modal-backdrop"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setAdoptionAnimal(null);
          }}
        >
          <form className="admin-adoption-modal" onSubmit={completeAdoption}>
            <div className="admin-adoption-modal-head">
              <div>
                <span>♥ FINALIZAR ADOÇÃO</span>
                <h2>{adoptionAnimal.name} encontrou uma família!</h2>
                <p>
                  Ao salvar, o animal será marcado como adotado, sairá dos disponíveis
                  e esta história será publicada imediatamente.
                </p>
              </div>
              <button type="button" onClick={() => setAdoptionAnimal(null)}>×</button>
            </div>

            <div className="admin-adoption-modal-body">
              <div className="adoption-before-after">
                <div className="adoption-old-photo">
                  <small>ANTES / PERFIL</small>
                  <img src={adoptionAnimal.photos?.[0]} alt={adoptionAnimal.name} />
                  <strong>{adoptionAnimal.name}</strong>
                </div>

                <div className="adoption-arrow">→</div>

                <label className="adoption-new-photo">
                  <small>NOVA FOTO / NOVA FAMÍLIA *</small>
                  {adoptionStoryForm.photo ? (
                    <img src={adoptionStoryForm.photo} alt="Nova família" />
                  ) : (
                    <div>
                      <span>＋</span>
                      <strong>Adicionar foto</strong>
                      <small>Foto do animal após a adoção</small>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => uploadAdoptionPhoto(e.target.files?.[0])}
                  />
                </label>
              </div>

              {savingAdoptionPhoto && (
                <div className="admin-adoption-processing">Enviando foto para o Cloudinary...</div>
              )}

              <div className="admin-adoption-story-fields">
                <label className="span-2">
                  <span>Título da história *</span>
                  <input
                    value={adoptionStoryForm.title}
                    onChange={(e) => setAdoptionStoryForm({ ...adoptionStoryForm, title: e.target.value })}
                    placeholder={`${adoptionAnimal.name} encontrou uma família`}
                  />
                </label>

                <label>
                  <span>Data da adoção</span>
                  <input
                    type="date"
                    value={adoptionStoryForm.adoptionDate}
                    onChange={(e) => setAdoptionStoryForm({ ...adoptionStoryForm, adoptionDate: e.target.value })}
                  />
                </label>

                <label>
                  <span>Nome da família / responsável</span>
                  <input
                    value={adoptionStoryForm.familyName}
                    onChange={(e) => setAdoptionStoryForm({ ...adoptionStoryForm, familyName: e.target.value })}
                    placeholder="Opcional"
                  />
                </label>

                <label className="span-2">
                  <span>Cidade</span>
                  <input
                    value={adoptionStoryForm.familyCity}
                    onChange={(e) => setAdoptionStoryForm({ ...adoptionStoryForm, familyCity: e.target.value })}
                    placeholder="Ex.: Gravataí"
                  />
                </label>

                <label className="span-2">
                  <span>Conte a história dessa adoção *</span>
                  <textarea
                    value={adoptionStoryForm.story}
                    onChange={(e) => setAdoptionStoryForm({ ...adoptionStoryForm, story: e.target.value })}
                    placeholder={`Conte como ${adoptionAnimal.name} encontrou sua nova família, como foi o encontro e qualquer detalhe especial dessa história.`}
                  />
                </label>
              </div>

              <div className="admin-adoption-result-preview">
                <strong>Ao concluir:</strong>
                <span>✓ Status de {adoptionAnimal.name}: Adotado</span>
                <span>✓ Sai da lista de animais disponíveis</span>
                <span>✓ Nova foto + história entram em “Histórias”</span>
                <span>✓ Candidatura aprovada vinculada ao animal pode ser marcada como adotada</span>
              </div>
            </div>

            <div className="admin-adoption-modal-footer">
              <button type="button" className="button secondary" onClick={() => setAdoptionAnimal(null)}>
                Cancelar
              </button>
              <button className="button primary adoption-final-save" type="submit" disabled={savingAdoptionPhoto}>
                ♥ Concluir adoção e publicar
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
