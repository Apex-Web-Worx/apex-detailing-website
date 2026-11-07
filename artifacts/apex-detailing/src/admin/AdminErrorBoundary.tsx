import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

/** Keeps /admin usable if a child page/modal throws. */
export default class AdminErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[admin] render crash:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="apex-admin min-h-dvh flex items-center justify-center p-6 bg-[#050505] text-white">
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[#111111] p-6 space-y-4">
            <h1 className="text-lg font-bold">Admin hit an error</h1>
            <p className="text-sm text-[#9CA3AF] break-words">
              {this.state.error.message || "Something broke while rendering."}
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="min-h-12 rounded-xl bg-[#FF2AD4] text-sm font-semibold"
                onClick={() => {
                  this.setState({ error: null });
                  window.location.assign("/admin");
                }}
              >
                Reload admin
              </button>
              <button
                type="button"
                className="min-h-12 rounded-xl border border-white/10 text-sm text-[#9CA3AF]"
                onClick={() => {
                  try {
                    localStorage.removeItem("apex_admin_token");
                  } catch {
                    // ignore
                  }
                  window.location.assign("/admin");
                }}
              >
                Sign out &amp; retry
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
