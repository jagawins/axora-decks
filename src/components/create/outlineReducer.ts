import type { OutlineSlide, OutlineAction } from "@/types/research-mode";

export function outlineReducer(
  state: OutlineSlide[],
  action: OutlineAction
): OutlineSlide[] {
  switch (action.type) {
    case "SET":
      return action.slides;

    case "REORDER": {
      const oldIndex = state.findIndex((s) => s.id === action.activeId);
      const newIndex = state.findIndex((s) => s.id === action.overId);
      if (oldIndex === -1 || newIndex === -1) return state;
      const next = [...state];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);
      return next;
    }

    case "EDIT_TITLE":
      return state.map((s) =>
        s.id === action.id ? { ...s, title: action.title } : s
      );

    case "EDIT_POINT":
      return state.map((s) => {
        if (s.id !== action.id) return s;
        const keyPoints = [...s.keyPoints];
        keyPoints[action.pointIndex] = action.value;
        return { ...s, keyPoints };
      });

    case "ADD":
      return [
        ...state,
        {
          id: crypto.randomUUID(),
          title: "New Slide",
          keyPoints: ["", "", ""],
        },
      ];

    case "DELETE":
      return state.filter((s) => s.id !== action.id);

    default:
      return state;
  }
}
