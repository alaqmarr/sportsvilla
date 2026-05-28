"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { FiCheckCircle, FiXCircle, FiInfo } from "react-icons/fi";

type AlertType = "success" | "error" | "info";

interface AlertContextType {
  showAlert: (message: string, type?: AlertType) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<{ message: string; type: AlertType } | null>(null);

  const showAlert = (message: string, type: AlertType = "info") => {
    setAlert({ message, type });
  };

  const closeAlert = () => {
    setAlert(null);
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-[#161923] border border-[#2a2d3e] rounded-xl p-8 w-full max-w-sm shadow-2xl text-center">
            <div className="flex justify-center mb-6">
              {alert.type === 'success' && <FiCheckCircle size={64} className="text-emerald-400" />}
              {alert.type === 'error' && <FiXCircle size={64} className="text-red-400" />}
              {alert.type === 'info' && <FiInfo size={64} className="text-blue-400" />}
            </div>
            <h2 className="text-xl font-bold font-['Outfit'] text-white mb-3">
              {alert.type === 'success' ? 'Success!' : alert.type === 'error' ? 'Oops, an Error!' : 'Information'}
            </h2>
            <p className="text-gray-400 text-base mb-8">{alert.message}</p>
            <button
              className={`w-full rounded-lg px-5 py-3 text-sm font-semibold cursor-pointer transition-colors ${
                alert.type === 'error'
                  ? 'border border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
              onClick={closeAlert}
            >
              Close
            </button>
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
