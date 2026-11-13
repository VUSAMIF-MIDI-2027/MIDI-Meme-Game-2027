import type { ComponentProps } from "react";
import type { SignUp } from "@clerk/nextjs";
import styles from "./AuthPanel.module.css";

type AuthAppearance = NonNullable<ComponentProps<typeof SignUp>["appearance"]>;

export const authAppearance: AuthAppearance = {
    variables: {
        colorPrimary: "#0075b5",
        colorBackground: "#0a0a0a",
        colorForeground: "#ffffff",
        colorMutedForeground: "#898f93",
        colorInput: "#101010",
        colorInputForeground: "#ffffff",
        colorNeutral: "#ffffff",
        colorMuted: "#101010",
        colorBorder: "#333333",
        fontFamily: "inherit",
        borderRadius: "0.75rem",
    },
    elements: {
        rootBox: { width: "100%" },
        cardBox: {
            width: "100%",
            background: "transparent",
            boxShadow: "none",
            borderRadius: 0,
        },
        card: {
            background: "transparent",
            padding: "4px",
            overflow: "visible",
            border: "none",
            boxShadow: "none",
        },
        header: { textAlign: "left" },
        headerTitle: {
            fontSize: "clamp(1.875rem, 2.8vw, 2.625rem)",
            fontWeight: 700,
            lineHeight: 1.1,
            color: "#ffffff",
        },
        headerSubtitle: { color: "#898f93", fontSize: "0.9375rem" },
        formFieldLabel: { color: "#ffffff", fontWeight: 600 },
        formFieldInput: styles.input,
        formFieldInputGroup: styles.inputGroup,
        formButtonPrimary: styles.primaryButton,
        socialButtonsBlockButton: {
            minHeight: "3rem",
            background: "#101010",
            border: "1px solid #333333",
            color: "#ffffff",
            boxShadow: "none",
        },
        footer: { background: "#0a0a0a", backgroundImage: "none" },
        footerAction: { display: "none" },
        formFieldAction: { color: "#48b5ed" },
        identityPreviewText: { color: "#ffffff" },
    },
};
