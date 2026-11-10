import { Component, type ErrorInfo, type ReactNode } from "react";
import { useLocation } from "react-router";

interface State {
  error: Error | null;
}

class Boundary extends Component<{ children: ReactNode; resetKey: string }, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State {
    return { error };
  }
  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[calwiz] route error", error, info.componentStack);
  }
  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const chunk = /Loading chunk|dynamically imported module|Failed to fetch/i.test(error.message);
    return (
      <div role="alert" className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="text-2xl">{chunk ? "This part of Calwiz isn't available offline yet" : "Something went wrong"}</h1>
        <p className="mt-3 text-sm text-muted">
          {chunk
            ? "Reconnect once to download it, or reload if the app was just updated."
            : "The calculation or page failed to render. Your saved data is untouched."}
        </p>
        <button className="btn-outline mt-6" onClick={() => location.reload()}>
          Reload
        </button>
        {!chunk && <pre className="mt-6 overflow-auto rounded-xl bg-surface p-3 text-left text-2xs text-faint">{error.message}</pre>}
      </div>
    );
  }
}

export function RouteBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <Boundary resetKey={pathname}>{children}</Boundary>;
}
