"use client"

// Ícones por origem e status — ajuda visual rápida na lista/modal.
import {
  Globe,
  Megaphone,
  Share2,
  UserPlus,
  Phone,
  PhoneCall,
  type LucideIcon,
} from "lucide-react"

import type { LeadSource, LeadStatus } from "@/types/lead"

export const SOURCE_ICONS: Record<LeadSource, LucideIcon> = {
  meta_ads: Megaphone,
  google_ads: Globe,
  referral: Share2,
  organic: UserPlus,
}

export const STATUS_ICONS: Record<LeadStatus, LucideIcon> = {
  new: Phone,
  contacted: PhoneCall,
}