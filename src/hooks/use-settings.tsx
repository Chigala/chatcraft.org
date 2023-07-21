import {
  useState,
  useCallback,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
  type FC,
} from "react";
import { useLocalStorage } from "react-use";

import { serializer, deserializer, key, defaults, type Settings } from "../lib/settings";

type SettingsContextType = {
  settings: Settings;
  setSettings: (newSettings: Settings) => void;
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaults,
  setSettings: () => {
    /* do nothing */
  },
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useLocalStorage<Settings>(key, defaults, {
    raw: false,
    serializer,
    deserializer,
  });

  const [state, setState] = useState<Settings>(settings || defaults);

  // Get the OpenRouter.ai code, if present on the URL
  const searchParams = new URLSearchParams(window.location.search);
  const openRouterCode = searchParams.get("code");

  const handleOpenRouterCodeExchange = (code: string) => {
    const requestBody = {
      code: code,
    };

    fetch("https://openrouter.ai/api/v1/auth/keys", {
      method: "POST",
      body: JSON.stringify(requestBody),
    })
      .then((response) => response.json())
      .then((data) => {
        const apiKey = data.key;
        if (apiKey !== undefined) {
          setSettings({ ...state, apiKey: apiKey });
          // Strip out openRouter's code from the URL
          searchParams.delete("code");
          const { origin, pathname, hash } = window.location;
          const urlWithoutCode = `${origin}${pathname}${hash}${searchParams.toString()}`;
          window.history.replaceState({}, document.title, urlWithoutCode);
        } else {
          console.error("OpenRouter OAuth PKCE response missing API key");
        }
      })
      .catch((error) => {
        console.error("Error authenticating with OpenRouter", error);
      });
  };

  useEffect(() => {
    if (openRouterCode) {
      handleOpenRouterCodeExchange(openRouterCode);
    }
  }, [openRouterCode]);

  useEffect(() => {
    setState(settings || defaults);
  }, [settings]);

  const updateSettings = useCallback(
    (newSettings: Settings) => {
      const updated = { ...state, ...newSettings };
      setState(updated);
      setSettings(updated);
    },
    [state, setSettings]
  );

  const value = { settings: state, setSettings: updateSettings };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
