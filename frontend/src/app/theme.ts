export type AppTheme = {
  colors: {
    bg: string;
    surface: string;
    surface2: string;
    border: string;
    primary: string;
    secondary: string;
    accent: string;      
    accent2: string;       
    success: string;
    danger: string;
  };
  radii: { lg: string; md: string; sm: string };
  shadow: string;
};

export const theme: AppTheme = {
  colors: {
    bg:       "#ffffff",   // White background (v0 style)
    surface:  "#f9f9f9",   // Light gray surface for sidebar
    surface2: "#f3f3f3",   // Slightly darker gray
    border:   "#e5e5e5",   // Light border
    primary:  "#171717",   // Almost black text
    secondary:"#737373",   // Gray secondary text
    accent:   "#0d9488",   // Teal for primary actions/highlights
    accent2:  "#18181b",   // Dark gray for text emphasis (not bright cyan)
    success:  "#22c55e",   // Green
    danger:   "#ef4444",   // Red
  },
  radii: { lg: "24px", md: "14px", sm: "8px" },
  shadow: "0 10px 30px rgba(0,0,0,.08)",
};
