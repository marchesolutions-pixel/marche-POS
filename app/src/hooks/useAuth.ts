export function useAuth() {
  const raw =
    typeof window !== "undefined" ? localStorage.getItem("currentUser") : null;
  const user = raw ? JSON.parse(raw) : null;

  return {
    user,
    login: (u: any) => {
      if (typeof window !== "undefined")
        localStorage.setItem("currentUser", JSON.stringify(u));
    },
    logout: () => {
      if (typeof window !== "undefined") localStorage.removeItem("currentUser");
      if (typeof window !== "undefined") window.location.href = "/login";
    },
  };
}
