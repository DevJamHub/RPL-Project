import {
  Utensils,
  Car,
  Film,
  ShoppingCart,
  BookOpen,
  Activity,
  PiggyBank,
  MoreHorizontal,
  Wallet,
  Award,
  Briefcase,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Peta ikon: menghubungkan nama ikon string (dari store/DB)
 * ke komponen Lucide React yang sesungguhnya.
 */
export const iconMap: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  film: Film,
  "shopping-cart": ShoppingCart,
  book: BookOpen,
  activity: Activity,
  "piggy-bank": PiggyBank,
  "more-horizontal": MoreHorizontal,
  wallet: Wallet,
  award: Award,
  briefcase: Briefcase,
};

/**
 * Helper: mendapatkan komponen ikon dari nama string,
 * dengan fallback ke MoreHorizontal jika tidak ditemukan.
 */
export function getIcon(name: string): LucideIcon {
  return iconMap[name] || MoreHorizontal;
}
