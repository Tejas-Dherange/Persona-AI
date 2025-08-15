import '../app/globals.css';

// Custom App to ensure global CSS (Tailwind) loads for pages/ routes like /dashboard
export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
