import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

/**
 * Provides a counter that increments each time the app comes back
 * from background → active.  Screens can use the `useAppResume` hook
 * to re-fetch data whenever the app is foregrounded.
 */
const AppResumeContext = createContext(0);

export function AppResumeProvider({ children }: { children: React.ReactNode }) {
  const [resumeCount, setResumeCount] = useState(0);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState: AppStateStatus) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextState === "active"
        ) {
          setResumeCount((c) => c + 1);
        }
        appState.current = nextState;
      },
    );
    return () => subscription.remove();
  }, []);

  return (
    <AppResumeContext.Provider value={resumeCount}>
      {children}
    </AppResumeContext.Provider>
  );
}

/**
 * Returns a counter that increments every time the app resumes from background.
 * Use it as a dependency in useEffect to re-fetch data on resume:
 *
 * ```ts
 * const resumeCount = useAppResume();
 * useEffect(() => { fetchMyData(); }, [resumeCount]);
 * ```
 */
export function useAppResume(): number {
  return useContext(AppResumeContext);
}
