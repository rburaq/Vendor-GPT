import React, { createContext, useContext, useState, type ReactNode } from "react";
import QuerySenderModal, { type PlanType } from "../components/ui/QuerySenderModal";

interface QueryModalContextType {
  openQueryModal: (plan?: PlanType) => void;
  closeQueryModal: () => void;
  isOpen: boolean;
  selectedPlan: PlanType;
}

const QueryModalContext = createContext<QueryModalContextType | undefined>(undefined);

export function QueryModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("Starter");

  const openQueryModal = (plan?: PlanType) => {
    if (plan) {
      setSelectedPlan(plan);
    }
    setIsOpen(true);
  };

  const closeQueryModal = () => {
    setIsOpen(false);
  };

  return (
    <QueryModalContext.Provider
      value={{
        openQueryModal,
        closeQueryModal,
        isOpen,
        selectedPlan,
      }}
    >
      {children}
      <QuerySenderModal
        isOpen={isOpen}
        onClose={closeQueryModal}
        initialPlan={selectedPlan}
      />
    </QueryModalContext.Provider>
  );
}

export function useQueryModal() {
  const context = useContext(QueryModalContext);
  if (!context) {
    throw new Error("useQueryModal must be used within a QueryModalProvider");
  }
  return context;
}
