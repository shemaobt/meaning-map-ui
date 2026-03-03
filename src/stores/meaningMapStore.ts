import { create } from "zustand";
import type {
  MeaningMap,
  MeaningMapData,
  PersonEntry,
  PlaceEntry,
  ObjectEntry,
  QAPair,
  ReviewState,
} from "../types/meaningMap";
import { runChecks } from "../utils/validator";

interface MeaningMapStore {
  currentMap: MeaningMap | null;
  reviewState: ReviewState;

  setFromBackend: (map: MeaningMap) => void;
  setData: (data: MeaningMapData) => void;
  clear: () => void;

  updateLevel1Arc: (arc: string) => void;
  updateSceneTitle: (sceneIndex: number, title: string) => void;
  updateScenePeople: (sceneIndex: number, people: PersonEntry[]) => void;
  updateScenePlaces: (sceneIndex: number, places: PlaceEntry[]) => void;
  updateSceneObjects: (sceneIndex: number, objects: ObjectEntry[]) => void;
  updateSceneSignificantAbsence: (sceneIndex: number, text: string) => void;
  updateSceneWhatHappens: (sceneIndex: number, text: string) => void;
  updateScenePurpose: (sceneIndex: number, text: string) => void;
  updatePropositionContent: (propIndex: number, content: QAPair[]) => void;

  markReviewed: (key: string) => void;
  unmarkReviewed: (key: string) => void;
  refreshWarnings: () => void;
}

const emptyReview: ReviewState = { reviewed: {}, warnings: [] };

export const useMeaningMapStore = create<MeaningMapStore>((set, get) => ({
  currentMap: null,
  reviewState: emptyReview,

  setFromBackend: (map) => {
    const warnings = runChecks(map.data);
    set({ currentMap: map, reviewState: { reviewed: {}, warnings } });
  },

  setData: (data) => {
    const { currentMap } = get();
    if (!currentMap) return;
    const warnings = runChecks(data);
    set({
      currentMap: { ...currentMap, data },
      reviewState: { ...get().reviewState, warnings },
    });
  },

  clear: () => set({ currentMap: null, reviewState: emptyReview }),

  updateLevel1Arc: (arc) => {
    const { currentMap } = get();
    if (!currentMap) return;
    const data = { ...currentMap.data, level_1: { arc } };
    get().setData(data);
  },

  updateSceneTitle: (i, title) => {
    const { currentMap } = get();
    if (!currentMap) return;
    const scenes = [...currentMap.data.level_2_scenes];
    scenes[i] = { ...scenes[i], title };
    get().setData({ ...currentMap.data, level_2_scenes: scenes });
  },

  updateScenePeople: (i, people) => {
    const { currentMap } = get();
    if (!currentMap) return;
    const scenes = [...currentMap.data.level_2_scenes];
    scenes[i] = { ...scenes[i], people };
    get().setData({ ...currentMap.data, level_2_scenes: scenes });
  },

  updateScenePlaces: (i, places) => {
    const { currentMap } = get();
    if (!currentMap) return;
    const scenes = [...currentMap.data.level_2_scenes];
    scenes[i] = { ...scenes[i], places };
    get().setData({ ...currentMap.data, level_2_scenes: scenes });
  },

  updateSceneObjects: (i, objects) => {
    const { currentMap } = get();
    if (!currentMap) return;
    const scenes = [...currentMap.data.level_2_scenes];
    scenes[i] = { ...scenes[i], objects };
    get().setData({ ...currentMap.data, level_2_scenes: scenes });
  },

  updateSceneSignificantAbsence: (i, text) => {
    const { currentMap } = get();
    if (!currentMap) return;
    const scenes = [...currentMap.data.level_2_scenes];
    scenes[i] = { ...scenes[i], significant_absence: text };
    get().setData({ ...currentMap.data, level_2_scenes: scenes });
  },

  updateSceneWhatHappens: (i, text) => {
    const { currentMap } = get();
    if (!currentMap) return;
    const scenes = [...currentMap.data.level_2_scenes];
    scenes[i] = { ...scenes[i], what_happens: text };
    get().setData({ ...currentMap.data, level_2_scenes: scenes });
  },

  updateScenePurpose: (i, text) => {
    const { currentMap } = get();
    if (!currentMap) return;
    const scenes = [...currentMap.data.level_2_scenes];
    scenes[i] = { ...scenes[i], communicative_purpose: text };
    get().setData({ ...currentMap.data, level_2_scenes: scenes });
  },

  updatePropositionContent: (i, content) => {
    const { currentMap } = get();
    if (!currentMap) return;
    const props = [...currentMap.data.level_3_propositions];
    props[i] = { ...props[i], content };
    get().setData({ ...currentMap.data, level_3_propositions: props });
  },

  markReviewed: (key) =>
    set((s) => ({
      reviewState: {
        ...s.reviewState,
        reviewed: { ...s.reviewState.reviewed, [key]: true },
      },
    })),

  unmarkReviewed: (key) =>
    set((s) => {
      const reviewed = { ...s.reviewState.reviewed };
      delete reviewed[key];
      return { reviewState: { ...s.reviewState, reviewed } };
    }),

  refreshWarnings: () => {
    const { currentMap } = get();
    if (!currentMap) return;
    const warnings = runChecks(currentMap.data);
    set((s) => ({ reviewState: { ...s.reviewState, warnings } }));
  },
}));
