"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { FiCheckCircle, FiXCircle, FiInfo } from "react-icons/fi";

type AlertType = "success" | "error" | "info";

interface AlertAction {
  label: string;
  onClick: () => void;
}

interface AlertContextType {
  showAlert: (titleOrMessage: string, messageOrType?: string, type?: AlertType, options?: { actions?: AlertAction[] }) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<{ title: string; message: string; type: AlertType; actions?: AlertAction[] } | null>(null);

  const showAlert = (titleOrMessage: string, messageOrType?: string, type?: AlertType, options?: { actions?: AlertAction[] }) => {
    let title = "";
    let message = "";
    let alertType: AlertType = "info";

    if (type !== undefined) {
      // 3 args: title, message, type
      title = titleOrMessage;
      message = messageOrType as string;
      alertType = type;
    } else if (messageOrType === "success" || messageOrType === "error" || messageOrType === "info") {
      // 2 args: message, type
      message = titleOrMessage;
      alertType = messageOrType as AlertType;
      title = alertType === 'success' ? 'Success' : alertType === 'error' ? 'Error' : 'Information';
    } else if (messageOrType) {
      // 2 args: title, message (default info)
      title = titleOrMessage;
      message = messageOrType;
      alertType = "info";
    } else {
      // 1 arg: message
      message = titleOrMessage;
      alertType = "info";
      title = 'Information';
    }
    setAlert({ title, message, type: alertType, actions: options?.actions });
  };

  const closeAlert = () => {
    setAlert(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-8 w-full max-w-sm shadow-2xl text-center">
            <div className="flex justify-center mb-6">
              {alert.type === 'success' && <FiCheckCircle size={64} className="text-emerald-400" />}
              {alert.type === 'error' && <FiXCircle size={64} className="text-red-400" />}
              {alert.type === 'info' && <FiInfo size={64} className="text-blue-400" />}
            </div>
            <h2 className="text-xl font-bold font-['Outfit'] text-white mb-3">
              {alert.title}
            </h2>
            <p className="text-gray-400 text-sm mb-8">{alert.message}</p>
            <div className="flex flex-col gap-3">
              {alert.actions?.map((action, idx) => (
                <button
                  key={idx}
                  className="w-full rounded-lg px-5 py-3 text-sm font-bold cursor-pointer transition-colors bg-blue-600 hover:bg-blue-500 text-white"
                  onClick={() => {
                    action.onClick();
                    closeAlert();
                  }}
                >
                  {action.label}
                </button>
              ))}
              <button
                className={`w-full rounded-lg px-5 py-3 text-sm font-semibold cursor-pointer transition-colors ${
                  alert.type === 'error'
                    ? 'border border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent'
                    : 'bg-[#2a2d3e] hover:bg-[#3b3f54] text-white'
                }`}
                onClick={closeAlert}
              >
                Close
              </button>
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
