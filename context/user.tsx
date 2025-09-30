"use client";

import { WelcomeFormSchemaType } from "@/schema/file-schema";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface UserData {
  name: string;
  phone: string;
  dob: string;
}

interface UserContextType {
  user: Partial<UserData> | null;
  setUser: (data: Partial<UserData>) => void;
  clearUser: () => void;
  isloading: any;
  cancel: () => void;
}

const defaultUser: UserData = { name: "", phone: "", dob: "" };

const UserContext = createContext<UserContextType>({
  user: defaultUser,
  setUser: () => {},
  clearUser: () => {},
  isloading: true,
  cancel: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<Partial<UserData> | null>(null);
  const [isloading, setIsloading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      setUserState(JSON.parse(storedUser));
    }
  }, []);

  // Update localStorage whenever user changes
  const setUser = async (data: Partial<UserData>) => {
    const updatedUser: Partial<UserData> = data;
    setUserState(updatedUser);
    localStorage.setItem("userData", JSON.stringify(updatedUser));
  };

  const clearUser = () => {
    setUserState(defaultUser);
    localStorage.removeItem("userData");
  };

  const getUser = () => {
    setIsloading(true);
    const res = localStorage.getItem("userData");
    if (!res) {
      setUserState(null);
    } else {
      const user = JSON.parse(res);
      setUser(user);
    }
    setIsloading(false);
  };

  const cancel = () => {
    setIsloading(true);
    localStorage.removeItem("userData");
    setUserState(null);
    setIsloading(false);
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <UserContext.Provider
      value={{ user, setUser, clearUser, isloading, cancel }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the context
export const useUser = () => useContext(UserContext);
