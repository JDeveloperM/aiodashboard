import { Theme } from "@clerk/types"

export const customDarkTheme: Theme = {
  baseTheme: undefined,  // Remove the string "dark" and use undefined instead
  variables: {
    colorPrimary: "#3b82f6",
    colorBackground: "#0f172a",
    colorText: "#ffffff",
    colorTextSecondary: "#94a3b8",
    colorInputBackground: "#1e293b",
    colorInputText: "#ffffff",
    colorSuccess: "#22c55e",
    colorDanger: "#ef4444",
    colorWarning: "#f59e0b",
    borderRadius: "0.5rem"
  },
  elements: {
    // General elements
    card: "bg-slate-800 border border-slate-700 shadow-xl",
    headerTitle: "text-white",
    headerSubtitle: "text-slate-200",
    dividerLine: "bg-slate-700",
    dividerText: "text-slate-200",

    // Form elements
    formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
    formField: "border-slate-700",
    formFieldInput: "bg-slate-900 border-slate-700 text-white",
    formFieldLabel: "text-white",
    footerActionLink: "text-blue-400 hover:text-blue-300",

    // Social buttons
    socialButtonsBlockButton: "border-slate-700 hover:bg-slate-700",
    socialButtonsBlockButtonText: "text-white",

    // User button and popover
    userButtonAvatarBox: "h-8 w-8",
    userButtonPopoverCard: "bg-slate-800 border border-slate-700 shadow-xl",
    userButtonPopoverFooter: "border-t border-slate-700",
    userButtonPopoverActionButton: "text-white hover:text-white hover:bg-slate-700",
    userButtonPopoverActionButtonIcon: "text-white",

    // User preview
    identityPreviewText: "text-white",
    identityPreviewEditButtonIcon: "text-blue-400",
    userPreviewMainIdentifier: "text-white",
    userPreviewSecondaryIdentifier: "text-slate-200",

    // Account page
    accordionTriggerButton: "text-white",
    navbarButton: "text-white",
    profileSectionTitle: "text-white",
    profileSectionTitleText: "text-white",
    profileSectionPrimaryButton: "bg-blue-600 hover:bg-blue-700 text-white",
    profileSectionSecondaryButton: "text-white border-slate-600 hover:bg-slate-700",

    // Tables and data
    tableHeaderCell: "text-white",
    tableCell: "text-white",
    tableCellText: "text-white",

    // Badges and indicators
    badge: "text-white",
    badgeText: "text-white",

    // Buttons
    button: "text-white",
    buttonText: "text-white"
  }
};
