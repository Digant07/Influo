/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from "react";
import type { UserProfileSummary } from "@/types";

interface ListContextType {
  list: UserProfileSummary[];
  addToList: (profile: UserProfileSummary) => void;
  removeFromList: (userId: string) => void;
  isInList: (userId: string) => boolean;
}

const ListContext = createContext<ListContextType | undefined>(undefined);

export function ListProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<UserProfileSummary[]>(() => {
    const saved = localStorage.getItem("influencer_list");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("influencer_list", JSON.stringify(list));
  }, [list]);

  const addToList = (profile: UserProfileSummary) => {
    setList((prev) => {
      if (prev.some((p) => p.user_id === profile.user_id)) return prev;
      return [...prev, profile];
    });
  };

  const removeFromList = (userId: string) => {
    setList((prev) => prev.filter((p) => p.user_id !== userId));
  };

  const isInList = (userId: string) => {
    return list.some((p) => p.user_id === userId);
  };

  return (
    <ListContext.Provider value={{ list, addToList, removeFromList, isInList }}>
      {children}
    </ListContext.Provider>
  );
}

export function useList() {
  const context = useContext(ListContext);
  if (!context) {
    throw new Error("useList must be used within a ListProvider");
  }
  return context;
}
