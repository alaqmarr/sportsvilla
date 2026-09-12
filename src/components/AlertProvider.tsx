"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { FiCheckCircle, FiXCircle, FiInfo } from "react-icons/fi";

type AlertType = "success" | "error" | "info" | "warning";

interface AlertAction {
  label: string;
  onClick: () => any;
  style?: "primary" | "secondary" | "danger";
}

interface AlertState {
  title: string;
  message: string;
  type: AlertType;
  actions?: AlertAction[];
  hideCloseBtn?: boolean;
}

interface AlertContextType {
  showAlert: (titleOrMessage: string, messageOrType?: string, type?: AlertType, options?: { actions?: AlertAction[], hideCloseBtn?: boolean }) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText?: string,
    cancelText?: string,
    type?: AlertType
  ) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertState | null>(null);

  const showAlert = (titleOrMessage: string, messageOrType?: string, type?: AlertType, options?: { actions?: AlertAction[], hideCloseBtn?: boolean }) => {
    let title = "";
    let message = "";
    let alertType: AlertType = "info";

    if (type !== undefined) {
      title = titleOrMessage;
      message = messageOrType as string;
      alertType = type;
    } else if (messageOrType === "success" || messageOrType === "error" || messageOrType === "info" || messageOrType === "warning") {
      message = titleOrMessage;
      alertType = messageOrType as AlertType;
      title = alertType === 'success' ? 'Success' : alertType === 'error' ? 'Error' : alertType === 'warning' ? 'Warning' : 'Information';
    } else if (messageOrType) {
      title = titleOrMessage;
      message = messageOrType;
      alertType = "info";
    } else {
      message = titleOrMessage;
      alertType = "info";
      title = 'Information';
    }
    setAlert({ title, message, type: alertType, actions: options?.actions, hideCloseBtn: options?.hideCloseBtn });
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type: AlertType = "warning"
  ) => {
    setAlert({
      title,
      message,
      type,
      hideCloseBtn: true,
      actions: [
        {
          label: cancelText,
          style: "secondary",
          onClick: onCancel || (() => {})
        },
        {
          label: confirmText,
          style: type === "error" || type === "warning" ? "danger" : "primary",
          onClick: onConfirm
        }
      ]
    });
  };

  const closeAlert = () => {
    setAlert(null);
  };

  useEffect(() => {
    if (alert && alert.type !== 'error') {
      const timer = setTimeout(() => {
        closeAlert();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {alert && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="flex justify-center mb-6">
              {alert.type === 'success' && <FiCheckCircle size={64} className="text-emerald-400" />}
              {alert.type === 'error' && <FiXCircle size={64} className="text-red-400" />}
              {alert.type === 'warning' && <FiInfo size={64} className="text-amber-400" />}
              {alert.type === 'info' && <FiInfo size={64} className="text-blue-400" />}
            </div>
            <h2 className="text-xl font-bold font-['Outfit'] text-white mb-3">
              {alert.title}
            </h2>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">{alert.message}</p>
            <div className={`flex gap-3 ${alert.actions && alert.actions.length > 1 ? 'flex-row' : 'flex-col'}`}>
              {alert.actions?.map((action, idx) => {
                let btnClass = "";
                if (action.style === "danger") {
                  btnClass = "bg-red-500 hover:bg-red-600 text-white border-transparent";
                } else if (action.style === "secondary") {
                  btnClass = "bg-[#2a2d3e] hover:bg-[#3b3f54] text-white border-transparent";
                } else {
                  btnClass = "bg-orange-500 hover:bg-orange-600 text-white border-transparent";
                }
                return (
                  <button
                    key={idx}
                    className={`flex-1 rounded-xl px-5 py-3 text-sm font-bold cursor-pointer transition-colors shadow-lg ${btnClass}`}
                    onClick={async () => {
                      try {
                        const result = action.onClick();
                        if (result instanceof Promise) {
                          await result;
                        }
                      } finally {
                        closeAlert();
                      }
                    }}
                  >
                    {action.label}
                  </button>
                );
              })}
              {!alert.hideCloseBtn && (
                <button
                  className={`w-full rounded-xl px-5 py-3 text-sm font-semibold cursor-pointer transition-colors ${
                    alert.type === 'error'
                      ? 'border border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent'
                      : 'bg-[#2a2d3e] hover:bg-[#3b3f54] text-white'
                  }`}
                  onClick={closeAlert}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) throw new Error("useAlert must be used within AlertProvider");
  return context;
}
