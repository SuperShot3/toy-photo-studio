import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Plus, Trash2, Pencil, ImagePlus } from 'lucide-react';
import {
  STYLE_REF_PROMPT_MAX,
  type PromoImageStyle,
  type StyleSceneRef,
} from '../types';
import {
  addCustomStyleRef,
  deleteCustomStyleRef,
  listMergedStyleRefs,
  thumbnailStyleRefImage,
  updateCustomStyleRef,
} from '../utils/styleRefs';

interface StyleRefManagerProps {
  open: boolean;
  onClose: () => void;
  onRefsChange: () => void;
}

type FormState = {
  id?: string;
  style: PromoImageStyle;
  name: string;
  prompt: string;
  imageUrl: string;
};

const EMPTY_FORM: FormState = {
  style: 'luxury-promo',
  name: '',
  prompt: '',
  imageUrl: '',
};

export const StyleRefManager: React.FC<StyleRefManagerProps> = ({
  open,
  onClose,
  onRefsChange,
}) => {
  const [tab, setTab] = useState<PromoImageStyle>('luxury-promo');
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [tick, setTick] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const refs = listMergedStyleRefs();
  const visible = useMemo(
    () => refs.filter((ref) => ref.style === tab),
    [refs, tab, open, tick]
  );

  const bumpRefs = () => {
    setTick((value) => value + 1);
    onRefsChange();
  };

  useEffect(() => {
    if (!open) {
      setForm(null);
      setError(null);
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !form) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, form]);

  if (!open) return null;

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a JPEG, PNG, or WEBP photo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = await thumbnailStyleRefImage(String(reader.result));
        setForm((current) => (current ? { ...current, imageUrl: dataUrl } : current));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not read that image.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      if (form.id) {
        updateCustomStyleRef(form.id, {
          name: form.name,
          prompt: form.prompt,
          imageUrl: form.imageUrl,
          style: form.style,
        });
      } else {
        addCustomStyleRef({
          style: form.style,
          name: form.name,
          prompt: form.prompt,
          imageUrl: form.imageUrl,
        });
      }
      setForm(null);
      bumpRefs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this look.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (ref: StyleSceneRef) => {
    if (ref.builtIn) return;
    deleteCustomStyleRef(ref.id);
    bumpRefs();
    if (form?.id === ref.id) setForm(null);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 cursor-pointer"
        aria-label="Close style reference manager"
        onClick={() => (form ? setForm(null) : onClose())}
      />
      <div className="relative w-full sm:max-w-3xl max-h-[92vh] bg-white rounded-t-2xl sm:rounded-2xl border border-slate-200 shadow-xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Manage style references</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Built-in looks stay in the app. Custom looks are saved in this browser.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 sm:px-5 pt-3 flex items-center gap-2">
          {([
            ['luxury-promo', 'Luxury'],
            ['styled-promo', 'Promo'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id);
                setForm(null);
                setError(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider cursor-pointer ${
                tab === id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
          <div className="flex-1" />
          {!form && (
            <button
              type="button"
              onClick={() => {
                setForm({ ...EMPTY_FORM, style: tab });
                setError(null);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add look
            </button>
          )}
        </div>

        <div className="overflow-y-auto p-4 sm:p-5 space-y-4">
          {form ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                {form.id ? 'Edit look' : 'New look'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border border-dashed border-slate-300 bg-white overflow-hidden flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-600 cursor-pointer"
                >
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImagePlus className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-semibold">Upload scene</span>
                    </>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleImageFile(file);
                    event.target.value = '';
                  }}
                />

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Name
                    </label>
                    <input
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      maxLength={48}
                      placeholder="e.g. Gold velvet drape"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                      Scene prompt
                      <span className="ml-1.5 font-medium normal-case tracking-normal text-slate-400">
                        {form.prompt.length}/{STYLE_REF_PROMPT_MAX}
                      </span>
                    </label>
                    <textarea
                      value={form.prompt}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          prompt: event.target.value.slice(0, STYLE_REF_PROMPT_MAX),
                        })
                      }
                      rows={5}
                      maxLength={STYLE_REF_PROMPT_MAX}
                      placeholder="Describe the empty scene: lighting, surface, palette. Keep the lower 22–24% calm for type. Do not mention a toy or flowers."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white border border-slate-200 px-3 py-2.5 text-[10px] text-slate-500 leading-relaxed space-y-1">
                <p className="font-bold text-slate-600 uppercase tracking-wider">Guidelines</p>
                <p>Describe the empty scene only — lighting, surface, props, and color. No product.</p>
                <p>Keep the lower ~22–24% of the frame calm so a product name can sit on the photo.</p>
                <p>Prompt max {STYLE_REF_PROMPT_MAX} characters. Square-ish JPEG or PNG; we thumbnail it automatically.</p>
              </div>

              {error && <p className="text-[11px] text-red-600">{error}</p>}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving}
                  className="px-3.5 py-2 rounded-lg bg-indigo-600 text-white text-[11px] font-bold hover:bg-indigo-700 cursor-pointer disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save look'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForm(null);
                    setError(null);
                  }}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {visible.map((ref) => (
                <div
                  key={ref.id}
                  className="rounded-xl border border-slate-200 overflow-hidden bg-white"
                >
                  <div className="aspect-square bg-slate-100">
                    <img src={ref.imageUrl} alt={ref.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2.5 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[11px] font-bold text-slate-800 truncate">{ref.name}</p>
                      {ref.builtIn ? (
                        <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                          Built-in
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-3 leading-relaxed">
                      {ref.prompt}
                    </p>
                    {!ref.builtIn && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setForm({
                              id: ref.id,
                              style: ref.style,
                              name: ref.name,
                              prompt: ref.prompt,
                              imageUrl: ref.imageUrl,
                            });
                            setError(null);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(ref)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
