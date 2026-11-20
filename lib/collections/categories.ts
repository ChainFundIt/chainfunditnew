import type { LucideIcon } from "lucide-react";
import {
  Award,
  Baby,
  Cake,
  Flower2,
  Gift,
  GraduationCap,
  Heart,
  HeartPulse,
  Plane,
  Trophy,
  Users,
} from "lucide-react";

export type CollectionCategoryId =
  | "wedding"
  | "funeral"
  | "baby"
  | "birthday"
  | "reunion"
  | "graduation"
  | "send-off"
  | "group-gift"
  | "trip"
  | "hangout"
  | "sports"
  | "charity";

export interface CollectionCategoryOption {
  id: CollectionCategoryId;
  label: string;
  icon: LucideIcon;
  titlePlaceholder: string;
}

export const COLLECTION_CATEGORIES: CollectionCategoryOption[] = [
  {
    id: "wedding",
    label: "A wedding celebration",
    icon: HeartPulse,
    titlePlaceholder: "Wedding gift fund",
  },
  {
    id: "funeral",
    label: "A funeral or memorial",
    icon: Flower2,
    titlePlaceholder: "Memorial collection",
  },
  {
    id: "baby",
    label: "A new baby or naming ceremony",
    icon: Baby,
    titlePlaceholder: "Baby shower fund",
  },
  {
    id: "birthday",
    label: "A birthday celebration",
    icon: Cake,
    titlePlaceholder: "Birthday contribution",
  },
  {
    id: "reunion",
    label: "A school reunion or anniversary",
    icon: GraduationCap,
    titlePlaceholder: "Reunion fund",
  },
  {
    id: "graduation",
    label: "A graduation celebration",
    icon: Award,
    titlePlaceholder: "Graduation gift",
  },
  {
    id: "send-off",
    label: "A send-off or retirement",
    icon: Gift,
    titlePlaceholder: "Send-off collection",
  },
  {
    id: "group-gift",
    label: "A group gift or surprise",
    icon: Gift,
    titlePlaceholder: "Group gift fund",
  },
  {
    id: "trip",
    label: "A group trip or holiday",
    icon: Plane,
    titlePlaceholder: "Trip fund",
  },
  {
    id: "hangout",
    label: "A hangout or fun activity",
    icon: Users,
    titlePlaceholder: "Activity pot",
  },
  {
    id: "sports",
    label: "A sports or fitness activity",
    icon: Trophy,
    titlePlaceholder: "Sports team fund",
  },
  {
    id: "charity",
    label: "A charity or community cause",
    icon: Heart,
    titlePlaceholder: "Community collection",
  },
];

const categoryById = new Map(
  COLLECTION_CATEGORIES.map((category) => [category.id, category])
);

export function getCollectionCategory(
  id: string | null | undefined
): CollectionCategoryOption | undefined {
  if (!id) return undefined;
  return categoryById.get(id as CollectionCategoryId);
}

export function getCollectionCategoryLabel(id: string | null | undefined): string | null {
  return getCollectionCategory(id)?.label ?? null;
}