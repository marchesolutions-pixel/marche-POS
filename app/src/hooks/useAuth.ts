export function useAuth() {
  const raw = typeof window !== "undefined" ? window.sessionStorage.getItem("currentUser") : null;
  const storedRaw =
    typeof window !== "undefined" && !raw
      ? window.localStorage.getItem("currentUser")
      : raw;

  if (typeof window !== "undefined" && raw === null) {
    window.localStorage.removeItem("currentUser");
  }

  let user = null;
  if (storedRaw) {
    try {
      user = JSON.parse(storedRaw);
    } catch {
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("currentUser");
        window.localStorage.removeItem("currentUser");
      }
      user = null;
    }
  }

  return {
    user,
    login: (u: any) => {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("currentUser", JSON.stringify(u));
        window.localStorage.removeItem("currentUser");
      }
    },
    logout: () => {
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("currentUser");
        window.localStorage.removeItem("currentUser");
        window.location.href = "/login";
      }
    },
  };
}
