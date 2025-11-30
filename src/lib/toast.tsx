import { CustomToast } from "../components/custom/CustomToast";
import type { ToastMessage } from "primereact/toast";

// Singleton toast service for use outside React components (e.g., middleware, utilities)
class ToastService {
  private static instance: ToastService;
  private listeners: Array<(message: ToastMessage) => void> = [];

  private constructor() {}

  static getInstance(): ToastService {
    if (!ToastService.instance) {
      ToastService.instance = new ToastService();
    }
    return ToastService.instance;
  }

  subscribe(listener: (message: ToastMessage) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  show(message: ToastMessage) {
    this.listeners.forEach((listener) => listener(message));
  }

  showSuccess(summary: string, detail?: string) {
    this.show({
      severity: "success",
      summary,
      detail,
      life: 3000,
      content: () => (
        <CustomToast type="success" title={summary} message={detail} />
      ),
    });
  }

  showError(summary: string, detail?: string) {
    this.show({
      severity: "error",
      summary,
      detail,
      life: 3000,
      content: () => (
        <CustomToast type="error" title={summary} message={detail} />
      ),
    });
  }

  showInfo(summary: string, detail?: string) {
    this.show({
      severity: "info",
      summary,
      detail,
      life: 3000,
      content: () => (
        <CustomToast type="info" title={summary} message={detail} />
      ),
    });
  }

  showWarn(summary: string, detail?: string) {
    this.show({
      severity: "warn",
      summary,
      detail,
      life: 3000,
      content: () => (
        <CustomToast type="warn" title={summary} message={detail} />
      ),
    });
  }
}

export const toastService = ToastService.getInstance();
