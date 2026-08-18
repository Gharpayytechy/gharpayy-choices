// @ts-nocheck
import { MessageCircle } from "lucide-react";
import { waFlatmatesSupport } from "@/lib/wa";
import { currentActor } from "@/flatmates/backend/store/actors";
import { getMe, track } from "@/flatmates/backend/store/store";
import { cn } from "@/referral-app/lib/utils";

export function WhatsAppHelp({ module = "Flatmates", action = "I need help", reference, city, area, label = "WhatsApp help", className = "" }: any) {
  const me = getMe();
  const actor = currentActor();
  const href = waFlatmatesSupport({ module, action, reference, city: city || me.city || "Bengaluru", area: area || me.areas?.[0], role: actor.role });
  return <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => track("whatsapp_handoff", { module, action, reference })}
    className={cn("inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-success text-primary-foreground text-sm font-semibold", className)}>
    <MessageCircle className="w-4 h-4" />{label}
  </a>;
}
