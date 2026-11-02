export interface Appliance {
  id: number;
  applianceName: string;
  description: string;
  powerWatts: number;
  minTemperature: number;
  likesCount: number;
  publicationStatus: "published" | "draft" | "deleted";
  imageUrl: string | null;
  videoUrl: string | null;
}

// Единственный источник карточек ЛР5. Все медиа обслуживает Vite, запросов к API нет.
export const APPLIANCES_MOCK: readonly Appliance[] = [
  {
    id: 1,
    applianceName: "Электрический чайник",
    description:
      "Электрический чайник с быстрым закипанием и удобной ручкой. Автоматически отключается после закипания и при отсутствии воды. Используйте на ровной сухой поверхности, соблюдая рекомендации производителя.",
    powerWatts: 2200,
    minTemperature: 10,
    likesCount: 3,
    publicationStatus: "published",
    imageUrl: "/media/kettle.png",
    videoUrl: "/media/kettle.mp4",
  },
  {
    id: 3,
    applianceName: "Утюг",
    description:
      "Паровой утюг для повседневного ухода за одеждой. Регулировка температуры позволяет выбрать режим для разных тканей.",
    powerWatts: 2000,
    minTemperature: 10,
    likesCount: 2,
    publicationStatus: "published",
    imageUrl: "/media/flatiron.png",
    videoUrl: "/media/flatiron.mp4",
  },
  {
    id: 7,
    applianceName: "Холодильник",
    description:
      "Двухкамерный холодильник для хранения продуктов. Отдельная морозильная камера и удобные полки помогают организовать пространство.",
    powerWatts: 200,
    minTemperature: 10,
    likesCount: 8,
    publicationStatus: "published",
    imageUrl: "/media/fridge.png",
    videoUrl: "/media/fridge.mp4",
  },
  {
    id: 12,
    applianceName: "Вентилятор",
    description:
      "Напольный вентилятор для циркуляции воздуха в комнате. Несколько скоростей позволяют настроить комфортный поток.",
    powerWatts: 45,
    minTemperature: 10,
    likesCount: 4,
    publicationStatus: "published",
    imageUrl: "/media/fan.png",
    videoUrl: "/media/fan.mp4",
  },
  {
    id: 18,
    applianceName: "Микроволновая печь",
    description:
      "Микроволновая печь для разогрева готовых блюд и размораживания продуктов.",
    powerWatts: 1200,
    minTemperature: 5,
    likesCount: 5,
    publicationStatus: "published",
    imageUrl: "/media/microwave.png",
    videoUrl: "/media/microwave.mp4",
  },
  // Карточка для демонстрации локальных изображения и видео по умолчанию.
  {
    id: 24,
    applianceName: "Резервный чайник",
    description:
      "У этой карточки не указаны фото и видео. Приложение подставляет локальные файлы по умолчанию.",
    powerWatts: 1800,
    minTemperature: 5,
    likesCount: 0,
    publicationStatus: "published",
    imageUrl: "",
    videoUrl: null,
  },
  {
    id: 30,
    applianceName: "Черновой прибор",
    description: "Новое устройство в разработке",
    powerWatts: 500,
    minTemperature: 10,
    likesCount: 0,
    publicationStatus: "draft",
    imageUrl: "/media/kettle.png",
    videoUrl: "/media/kettle.mp4",
  },
  {
    id: 40,
    applianceName: "Удалённый прибор",
    description: "Скрытая карточка",
    powerWatts: 900,
    minTemperature: 10,
    likesCount: 0,
    publicationStatus: "deleted",
    imageUrl: null,
    videoUrl: null,
  },
];

export const PUBLISHED_APPLIANCES = APPLIANCES_MOCK.filter(
  (item) => item.publicationStatus === "published",
);
export const DRAFT_APPLIANCE = APPLIANCES_MOCK.find(
  (item) => item.publicationStatus === "draft",
)!;
