import { useRef } from "react";
import { Camera, Plus, X } from "lucide-react";
import {
  MAX_BOOKING_PHOTOS,
  pickPhotosFromFiles,
  type PickedPhoto,
} from "@/lib/bookingPhotos";

export default function VehiclePhotoPicker({
  photos,
  onChange,
}: {
  photos: PickedPhoto[];
  onChange: (photos: PickedPhoto[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const remaining = MAX_BOOKING_PHOTOS - photos.length;

  const addFiles = async (list: FileList | null) => {
    if (!list || list.length === 0 || remaining <= 0) return;
    try {
      const added = await pickPhotosFromFiles(list, photos.length);
      onChange([...photos, ...added]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not add that photo.");
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (id: string) => {
    const next = photos.filter((p) => p.id !== id);
    const removed = photos.find((p) => p.id === id);
    if (removed) URL.revokeObjectURL(removed.previewUrl);
    onChange(next);
  };

  return (
    <div>
      <p className="block text-sm font-bold text-gray-300 mb-2">
        Photos of your vehicle <span className="text-gray-500 font-medium">(optional)</span>
      </p>
      <p className="text-xs text-gray-500 mb-3">
        Add up to {MAX_BOOKING_PHOTOS} photos so we can see your car before you arrive.
        They are deleted after your appointment.
      </p>
      <div className="flex flex-wrap gap-3">
        {photos.map((photo) => (
          <div key={photo.id} className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10">
            <img src={photo.previewUrl} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(photo.id)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
              aria-label="Remove photo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {remaining > 0 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-24 h-24 rounded-xl border border-dashed border-white/20 bg-white/[0.03] text-gray-400 hover:text-white hover:border-white/40 flex flex-col items-center justify-center gap-1"
          >
            {photos.length === 0 ? <Camera className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            <span className="text-[10px] font-bold uppercase tracking-wide">Add</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => void addFiles(e.target.files)}
      />
    </div>
  );
}
