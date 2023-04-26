import { TimeProvider } from "@/components/providers/TimeContext";
import "@/styles/tailwind.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <TimeProvider>
        <Component {...pageProps} />
      </TimeProvider>
    </QueryClientProvider>
  );
}
