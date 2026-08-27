// LanguageContext.jsx
// This file creates a "global state" for language.
// Any component in the app can read or change the language
// without passing it as props through every file.
//
// How React Context works:
//   Provider  = wraps the whole app, holds the state
//   useLanguage = hook any component uses to read/change language
 
 
// Step 1: create the context (like an empty box)
import React, { createContext, useContext, useState } from "react";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState("en");
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);