import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      searchPlaceholder: "🔍 Search...",
      filters: "Filters",
      category: "Category",
      start: "START",
      stop: "STOP",
      hoverCountry: "Hover over a country",
      localTime: "🕒 Local time",
      languages: "🗣️ Languages",
      population: "👥 Population",
      noResults: "No results",
      wildfires: "Wildfires",
      volcanoes: "Volcanoes",
      severeStorms: "Severe Storms",
      seaLakeIce: "Sea/Lake Ice",
      earthquakes: "Earthquakes",
      floods: "Floods"
    }
  },
  fr: {
    translation: {
      searchPlaceholder: "🔍 Rechercher...",
      filters: "Filtres",
      category: "Catégorie",
      start: "DÉMARRER",
      stop: "ARRÊTER",
      hoverCountry: "Survolez un pays",
      localTime: "🕒 Heure locale",
      languages: "🗣️ Langues",
      population: "👥 Population",
      noResults: "Aucun résultat",
      wildfires: "Feux de forêt",
      volcanoes: "Volcans",
      severeStorms: "Tempêtes",
      seaLakeIce: "Glaces",
      earthquakes: "Séismes",
      floods: "Inondations"
    }
  },
  es: {
    translation: {
      searchPlaceholder: "🔍 Buscar...",
      filters: "Filtros",
      category: "Categoría",
      start: "INICIAR",
      stop: "DETENER",
      hoverCountry: "Pasa el cursor sobre un país",
      localTime: "🕒 Hora local",
      languages: "🗣️ Idiomas",
      population: "👥 Población",
      noResults: "Sin resultados",
      wildfires: "Incendios forestales",
      volcanoes: "Volcanes",
      severeStorms: "Tormentas severas",
      seaLakeIce: "Hielo marino/lacustre",
      earthquakes: "Terremotos",
      floods: "Inundaciones"
    }
  },
  de: {
    translation: {
      searchPlaceholder: "🔍 Suchen...",
      filters: "Filter",
      category: "Kategorie",
      start: "START",
      stop: "STOPP",
      hoverCountry: "Fahre über ein Land",
      localTime: "🕒 Ortszeit",
      languages: "🗣️ Sprachen",
      population: "👥 Bevölkerung",
      noResults: "Keine Ergebnisse",
      wildfires: "Waldbrände",
      volcanoes: "Vulkane",
      severeStorms: "Schwere Stürme",
      seaLakeIce: "Meeres-/Seeeis",
      earthquakes: "Erdbeben",
      floods: "Überschwemmungen"
    }
  },
  hi: {
    translation: {
      searchPlaceholder: "🔍 खोजें...",
      filters: "फ़िल्टर",
      category: "श्रेणी",
      start: "शुरू करें",
      stop: "रोकें",
      hoverCountry: "किसी देश पर होवर करें",
      localTime: "🕒 स्थानीय समय",
      languages: "🗣️ भाषाएं",
      population: "👥 जनसंख्या",
      noResults: "कोई परिणाम नहीं",
      wildfires: "जंगल की आग",
      volcanoes: "ज्वालामुखी",
      severeStorms: "भयंकर तूफ़ान",
      seaLakeIce: "समुद्र/झील की बर्फ",
      earthquakes: "भूकंप",
      floods: "बाढ़"
    }
  },
  zh: {
    translation: {
      searchPlaceholder: "🔍 搜索...",
      filters: "筛选",
      category: "分类",
      start: "开始",
      stop: "停止",
      hoverCountry: "将鼠标悬停在国家上",
      localTime: "🕒 当地时间",
      languages: "🗣️ 语言",
      population: "👥 人口",
      noResults: "无结果",
      wildfires: "野火",
      volcanoes: "火山",
      severeStorms: "强风暴",
      seaLakeIce: "海/湖冰",
      earthquakes: "地震",
      floods: "洪水"
    }
  }
};

i18next
  .use(LanguageDetector) 
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false 
    }
  });

export default i18next;