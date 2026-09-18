"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://api.vyojin.co.in/api/v1";

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  customer: Customer | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    phone: string,
    password: string,
    passwordConfirmation: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("customer_token");

    if (!savedToken) {
      setLoading(false);
      return;
    }

    setToken(savedToken);

    fetchCustomer(savedToken);
  }, []);

  const fetchCustomer = async (authToken: string) => {
    try {
      const response = await fetch(`${API_URL}/customer/me`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem("customer_token");
        localStorage.removeItem("customer_user");

        setToken(null);
        setCustomer(null);

        return;
      }

      const result = await response.json();

      if (result.success) {
        setCustomer(result.data.customer);

        localStorage.setItem(
          "customer_user",
          JSON.stringify(result.data.customer)
        );
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/customer/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const result = await response.json();
if (!response.ok) {
  const message =
    result?.message ||
    result?.errors?.email?.[0] ||
    "Login failed.";

  throw new Error(message);
}

    if (!result.success) {
      throw new Error(result.message || "Login failed.");
    }

    const customerData = result.data.customer;
    const authToken = result.data.token;

    localStorage.setItem("customer_token", authToken);
    localStorage.setItem(
      "customer_user",
      JSON.stringify(customerData)
    );

    setToken(authToken);
    setCustomer(customerData);
  };

const register = async (
  name: string,
  email: string,
  phone: string,
  password: string,
  passwordConfirmation: string
) => {
  const payload = {
    name,
    email,
    phone,
    password,
    password_confirmation: passwordConfirmation,
  };

  console.log("REGISTER PAYLOAD:", payload);

  const response = await fetch(`${API_URL}/customer/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  console.log("REGISTER STATUS:", response.status);
  console.log("REGISTER RESPONSE:", result);

  if (!response.ok) {
    let errorMessage = result?.message || "Registration failed.";

    if (result?.errors) {
      const firstField = Object.keys(result.errors)[0];
      const firstError = result.errors[firstField]?.[0];

      if (firstError) {
        errorMessage = `${firstField}: ${firstError}`;
      }
    }

    throw new Error(errorMessage);
  }

  if (!result.success) {
    throw new Error(
      result.message || "Registration failed."
    );
  }

  const customerData = result.data.customer;
  const authToken = result.data.token;

  localStorage.setItem(
    "customer_token",
    authToken
  );

  localStorage.setItem(
    "customer_user",
    JSON.stringify(customerData)
  );

  setToken(authToken);
  setCustomer(customerData);
};
  const logout = async () => {
    const currentToken =
      token || localStorage.getItem("customer_token");

    try {
      if (currentToken) {
        await fetch(`${API_URL}/customer/logout`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${currentToken}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      localStorage.removeItem("customer_token");
      localStorage.removeItem("customer_user");

      setToken(null);
      setCustomer(null);

      router.push("/");
    }
  };

  const refreshCustomer = async () => {
    const currentToken =
      token || localStorage.getItem("customer_token");

    if (!currentToken) {
      setCustomer(null);
      return;
    }

    await fetchCustomer(currentToken);
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        token,
        loading,
        login,
        register,
        logout,
        refreshCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}