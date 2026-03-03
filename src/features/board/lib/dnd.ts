import { KeyboardSensor, PointerSensor } from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

export const dndSensors = [
  {
    sensor: PointerSensor,
    options: {
      activationConstraint: { distance: 6 }
    }
  },
  {
    sensor: KeyboardSensor,
    options: {
      coordinateGetter: sortableKeyboardCoordinates
    }
  }
] as const;