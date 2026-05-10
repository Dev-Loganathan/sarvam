import { useCallback, useState } from "react";
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { fileToDataUrl } from "@/lib/customer-store";
import { CustomerDocument, DocumentType, DOCUMENT_LABELS } from "@/lib/customer-types";
import { useToast } from "@/hooks/use-toast";

interface Props {
  type: DocumentType;
  value?: CustomerDocument;
  onChange: (doc: CustomerDocument | undefined) => void;
  accept?: string;
  maxSizeMb?: number;
}

export function DocumentUpload({
  type,
  value,
  onChange,
  accept = "image/*,application/pdf",
  maxSizeMb = 5,
}: Props) {
  const { toast } = useToast();
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      if (file.size > maxSizeMb * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `Max ${maxSizeMb}MB allowed`,
          variant: "destructive",
        });
        return;
      }
      setLoading(true);
      try {
        const dataUrl = await fileToDataUrl(file);
        onChange({
          id: crypto.randomUUID(),
          type,
          name: file.name,
          mimeType: file.type,
          size: file.size,
          dataUrl,
          uploadedAt: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    },
    [maxSizeMb, onChange, toast, type]
  );

  const isImage = value?.mimeType.startsWith("image/");

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        {DOCUMENT_LABELS[type]}
      </p>
      {value ? (
        <div className="relative group rounded-lg border border-border bg-card p-3 flex items-center gap-3">
          <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center overflow-hidden shrink-0">
            {isImage ? (
              <img src={value.dataUrl} alt={value.name} className="w-full h-full object-cover" />
            ) : (
              <FileText className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{value.name}</p>
            <p className="text-xs text-muted-foreground">
              {(value.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 cursor-pointer transition-colors",
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-secondary/30",
            loading && "opacity-50 pointer-events-none"
          )}
        >
          <Upload className="w-5 h-5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground text-center">
            {loading ? "Uploading..." : "Drag & drop or click"}
          </p>
          <input
            type="file"
            className="hidden"
            accept={accept}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      )}
    </div>
  );
}

export function PhotoUpload({
  value,
  onChange,
}: {
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast({ title: "Photo too large", description: "Max 3MB", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="w-24 h-24 rounded-full bg-secondary border-2 border-border flex items-center justify-center overflow-hidden shrink-0">
        {value ? (
          <img src={value} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label className="inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-md border border-border bg-background hover:bg-secondary cursor-pointer w-fit">
          <Upload className="w-4 h-4" />
          {loading ? "Uploading..." : value ? "Replace" : "Upload Photo"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-xs text-destructive hover:underline w-fit"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
