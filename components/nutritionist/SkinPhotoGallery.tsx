"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

interface PhotoItem {
  path: string;
  url: string;
  takenAt: string;
}

/**
 * Closes the loop on the skin-photos upload feature (SkincareHome.tsx):
 * uploads have been working since that fix, but there was no viewer
 * anywhere — no DB column tracks these paths (unlike meals.log_photo_path
 * for meal photos), so Storage's own per-client folder listing is the
 * natural way to browse them, rather than adding a new table/column just
 * to duplicate what Storage already knows.
 *
 * Nutritionist-only — relies on the existing "nutritionist reads all skin
 * photos" RLS policy on the skin-photos bucket (0004_storage_policies.sql).
 */
export function SkinPhotoGallery({ clientId }: { clientId: string }) {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    async function loadPhotos() {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const { data: files, error: listError } = await supabase.storage
        .from("skin-photos")
        .list(clientId, { sortBy: { column: "created_at", order: "desc" } });

      if (cancelled) return;

      if (listError) {
        setError("Couldn't load skin photos.");
        setLoading(false);
        return;
      }

      if (!files || files.length === 0) {
        setPhotos([]);
        setLoading(false);
        return;
      }

      const paths = files.map((f) => `${clientId}/${f.name}`);
      const { data: signed, error: signError } = await supabase.storage
        .from("skin-photos")
        .createSignedUrls(paths, 3600);

      if (cancelled) return;

      if (signError || !signed) {
        setError("Couldn't load skin photos.");
        setLoading(false);
        return;
      }

      const items: PhotoItem[] = signed
        .map((s, i) => {
          if (!s.signedUrl) return null;
          const file = files[i];
          return {
            path: paths[i],
            url: s.signedUrl,
            takenAt: file.created_at
              ? new Date(file.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "",
          };
        })
        .filter((x): x is PhotoItem => x !== null);

      setPhotos(items);
      setLoading(false);
    }

    loadPhotos();
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-moss-400 text-xs">
        <Loader2 size={14} className="animate-spin" /> Loading skin photos...
      </div>
    );
  }

  if (error) {
    return <p className="text-xs text-clay-600 text-center py-4">{error}</p>;
  }

  if (photos.length === 0) {
    return (
      <p className="text-xs text-moss-400 text-center py-4">
        No skin photos logged yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {photos.map((photo) => (
        <a
          key={photo.path}
          href={photo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="tap-scale relative aspect-square rounded-lg overflow-hidden bg-moss-900/5"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.url} alt="Skin photo" className="w-full h-full object-cover" />
          {photo.takenAt && (
            <span className="absolute bottom-0 inset-x-0 bg-moss-900/50 text-white text-[9px] text-center py-0.5">
              {photo.takenAt}
            </span>
          )}
        </a>
      ))}
    </div>
  );
}