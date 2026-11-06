import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SettingsProvider } from "./context/SettingsContext.jsx";
import { ImagesProvider } from "./context/ImagesContext.jsx";
import { PaymentProvider } from "./context/PaymentContext.jsx";
import { ToastProvider } from "./components/ui/Toast.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

export default function App() {
  useEffect(() => {
    if (!import.meta.env.PROD) return;

    const blockKeyboardShortcuts = (event) => {
      const key = event.key.toLowerCase();
      const isDevToolsShortcut =
        event.key === "F12" ||
        (event.ctrlKey && event.shiftKey && key === "i") ||
        (event.ctrlKey && event.shiftKey && key === "j") ||
        (event.ctrlKey && event.shiftKey && key === "c") ||
        (event.ctrlKey && key === "u") ||
        (event.ctrlKey && key === "s") ||
        (event.metaKey && key === "s") ||
        (event.metaKey && event.altKey && key === "i") ||
        (event.metaKey && event.altKey && key === "j") ||
        (event.metaKey && event.altKey && key === "c") ||
        (event.metaKey && event.shiftKey && key === "c");

      if (isDevToolsShortcut) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const blockContextMenu = (event) => {
      event.preventDefault();
    };

    document.addEventListener("keydown", blockKeyboardShortcuts, { passive: false });
    document.addEventListener("contextmenu", blockContextMenu, { passive: false });

    return () => {
      document.removeEventListener("keydown", blockKeyboardShortcuts);
      document.removeEventListener("contextmenu", blockContextMenu);
    };
  }, []);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <SettingsProvider>
          <ImagesProvider>
            <PaymentProvider>
              <ToastProvider>
                <AppRoutes />
              </ToastProvider>
            </PaymentProvider>
          </ImagesProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}