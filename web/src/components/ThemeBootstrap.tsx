/**
 * Theme bootstrap — runs *before* React hydration so we never flash the wrong
 * theme. Mirrors the `<script>` block used by interview-prep-hub.
 *
 * This is a server component that injects a `<script>` into <head>.
 */
export function ThemeBootstrap() {
  const script = `(function(){try{var t=localStorage.getItem('sd-zth:theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
