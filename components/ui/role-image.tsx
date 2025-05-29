"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface RoleImageProps {
  role: "Copier" | "PRO" | "ROYAL"
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6", 
  lg: "w-8 h-8",
  xl: "w-12 h-12"
}

const roleImages = {
  Copier: "/images/copier.png",
  PRO: "/images/pro.png", 
  ROYAL: "/images/royal.png"
}

export function RoleImage({ role, size = "md", className }: RoleImageProps) {
  return (
    <Image
      src={roleImages[role]}
      alt={`${role} role`}
      width={size === "sm" ? 16 : size === "md" ? 24 : size === "lg" ? 32 : 48}
      height={size === "sm" ? 16 : size === "md" ? 24 : size === "lg" ? 32 : 48}
      className={cn(sizeClasses[size], "object-contain", className)}
    />
  )
}
