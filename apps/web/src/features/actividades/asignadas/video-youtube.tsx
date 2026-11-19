export function VideoYouTube({ video }: { video: { id: string; tituloOriginal: string; inicio?: number; fin?: number } }) {
  const parametros = new URLSearchParams({ rel: "0", cc_load_policy: "1", cc_lang_pref: "es", hl: "es", playsinline: "1" });
  if (video.inicio !== undefined) parametros.set("start", String(video.inicio));
  if (video.fin !== undefined) parametros.set("end", String(video.fin));
  return <section aria-label="Video de la actividad">
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
      <iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${video.id}?${parametros}`}
        title={`Video: ${video.tituloOriginal}`} allow="encrypted-media; picture-in-picture; fullscreen"
        referrerPolicy="strict-origin-when-cross-origin" loading="lazy" allowFullScreen />
    </div>
    <p className="mt-2 text-sm text-[var(--m-tinta)]">Si el video no carga, <a className="font-semibold underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
      href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer">ábrelo en YouTube</a>.</p>
  </section>;
}
