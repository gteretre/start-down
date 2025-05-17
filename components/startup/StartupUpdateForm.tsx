'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { validateForm } from '@/lib/validation';
import { Textarea } from '@/components/ui/textarea';
import MDEditor from '@/mike-mardown/src/MDEditor';
import Tooltip from '@/components/common/Tooltip';
import { Info } from 'lucide-react';
import { ImagePreview } from '@/components/ImageUtilities';
import { updateStartup, deleteStartup } from '@/lib/actions';
import { Startup } from '@/lib/models';
import Confirmation from '@/components/common/Confirmation';

const officialCategories = [
  'Tech',
  'Health',
  'Finance',
  'Education',
  'E-commerce',
  'Entertainment',
  'Travel',
  'Food',
  'Real Estate',
  'Transportation',
  'Energy',
  'Environment',
  'Manufacturing',
  'Retail',
  'Media',
  'Sports',
  'Nonprofit',
];

function StartupUpdateForm({ startup }: { startup: Startup }) {
  // Use 'image' as the field for the startup image, fallback to 'link' for backward compatibility
  const [form, setForm] = React.useState({
    title: startup.title,
    description: startup.description,
    category: startup.category,
    image: startup.image || '',
    pitch: startup.pitch || '',
  });
  const [isPending, setIsPending] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const original = {
    title: startup.title,
    description: startup.description,
    category: startup.category,
    image: startup.image || '',
    pitch: startup.pitch || '',
  };

  const [categoryInput, setCategoryInput] = React.useState(startup.category || '');
  const [showCategoryOptions, setShowCategoryOptions] = React.useState(false);
  const filteredCategories = React.useMemo(
    () =>
      officialCategories.filter((cat) => cat.toLowerCase().includes(categoryInput.toLowerCase())),
    [categoryInput]
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePitchChange = (value: string) => {
    setForm((prev) => ({ ...prev, pitch: value || '' }));
  };

  const handleUndo = (field: keyof typeof original) => {
    setForm((prev) => ({ ...prev, [field]: original[field] }));
    if (field === 'category') setCategoryInput(original.category);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    const currentValues = { ...form, link: form.image };
    const fieldErrors = validateForm(currentValues) || {};
    if (Object.keys(fieldErrors).length > 0) {
      toast({
        title: 'Input Error',
        description: 'Please check your inputs and try again',
        variant: 'destructive',
      });
      setIsPending(false);
      return;
    }
    try {
      const result = await updateStartup(startup._id, currentValues);
      if (result && result.status === 'SUCCESS') {
        toast({ title: 'Success', description: 'Startup updated!' });
        router.push(`/startup/${startup.slug}`);
      } else if (result && result.error) {
        toast({ title: 'Update Error', description: result.error, variant: 'destructive' });
      } else {
        toast({
          title: 'Warning',
          description: 'Update may not have completed.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating startup:', error);
      toast({
        title: 'Something went wrong',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
    setIsPending(false);
  };

  const isFormIncomplete =
    !form.title.trim() || !form.description.trim() || !form.category.trim() || !form.pitch.trim();

  const [showConfirm, setShowConfirm] = React.useState(false);

  const handleDelete = async () => {
    setIsPending(true);
    try {
      const result = await deleteStartup(startup._id);
      if (result && result.success) {
        toast({ title: 'Deleted', description: result.message });
        router.push('/');
      } else {
        toast({
          title: 'Delete Error',
          description: result?.message || 'Failed to delete.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting startup:', error);
      toast({
        title: 'Delete Error',
        description: 'Failed to delete.',
        variant: 'destructive',
      });
    }
    setIsPending(false);
    setShowConfirm(false);
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 lg:flex-row lg:items-start lg:gap-12">
      <Confirmation
        open={showConfirm}
        onConfirmAction={handleDelete}
        onCancelAction={() => setShowConfirm(false)}
        title="Confirm Deletion of the startup"
        message="This action cannot be undone. To confirm, type the word below:"
      />
      <section className="w-full">
        <form onSubmit={handleSubmit} className="relative mx-auto max-w-3xl items-center">
          <div className="mx-10 grid items-center gap-8">
            <div className="relative flex items-center gap-2">
              <div className="flex-1">
                <label htmlFor="title" className="form-label">
                  Project Name
                  <Tooltip text="Title cannot be changed" position="right">
                    <Info className="info-icon" />
                  </Tooltip>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  className="form-input cursor-not-allowed bg-muted/50"
                  value={form.title}
                  readOnly
                  disabled
                />
              </div>
            </div>
            <div className="relative flex items-center gap-2">
              <div className="flex-1">
                <label htmlFor="description" className="form-label">
                  Executive Summary
                  <Tooltip text="20-500 characters" position="right">
                    <Info className="info-icon" />
                  </Tooltip>
                </label>
                <Textarea
                  id="description"
                  name="description"
                  className="form-input min-h-[120px]"
                  required
                  placeholder="Provide a concise summary of your startup concept (2-3 sentences)"
                  value={form.description}
                  onChange={handleInputChange}
                />
              </div>
              {form.description !== original.description && (
                <button
                  type="button"
                  className="clear-btn clear-btn-center-y"
                  onClick={() => handleUndo('description')}
                >
                  Undo
                </button>
              )}
            </div>
            <div className="relative flex items-center gap-2">
              <div className="flex-1">
                <label htmlFor="category" className="form-label">
                  Industry Category
                  <Tooltip text="3-20 characters" position="right">
                    <Info className="info-icon" />
                  </Tooltip>
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  className="form-input"
                  required
                  autoComplete="off"
                  placeholder="Choose a category or enter your own"
                  value={form.category}
                  onChange={(e) => {
                    handleInputChange(e);
                    setCategoryInput(e.target.value);
                    setShowCategoryOptions(true);
                  }}
                  onFocus={() => setShowCategoryOptions(true)}
                  onBlur={() => setTimeout(() => setShowCategoryOptions(false), 100)}
                />
                {showCategoryOptions && filteredCategories.length > 0 && (
                  <ul className="bordershadow-lg absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-secondary">
                    {filteredCategories.map((cat) => (
                      <li
                        key={cat}
                        className="cursor-pointer px-4 py-2 hover:bg-blue-400"
                        onMouseDown={() => {
                          setForm((prev) => ({ ...prev, category: cat }));
                          setCategoryInput(cat);
                          setShowCategoryOptions(false);
                        }}
                      >
                        {cat}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {form.category !== original.category && (
                <button
                  type="button"
                  className="clear-btn clear-btn-center-y"
                  onClick={() => handleUndo('category')}
                >
                  Undo
                </button>
              )}
            </div>
            <div className="relative flex items-center gap-2">
              <div className="flex-1">
                <label htmlFor="image" className="form-label">
                  Image URL
                  <Tooltip text="See allowed domains below" position="right">
                    <Info className="info-icon" />
                  </Tooltip>
                </label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  className="form-input"
                  placeholder="(Optional) Enter a URL for your startup's image"
                  value={form.image}
                  onChange={handleInputChange}
                />
                <div className="mt-2 flex h-40 w-full items-center justify-center rounded border bg-muted/10">
                  <ImagePreview src={form.image} alt="Startup preview" />
                </div>
                <p className="mx-10 mt-2 text-xs text-muted-foreground">
                  Allowed domains:{' '}
                  <span className="whitespace-normal break-words">
                    placehold.co, drive.google.com, docs.google.com, photos.google.com,
                    dl.dropboxusercontent.com, onedrive.live.com, icloud.com, i.imgur.com,
                    live.staticflickr.com, *.s3.amazonaws.com, www.dropbox.com, imgur.com,
                    imgbb.com, images.unsplash.com, unsplash.com, cdn.pixabay.com, pixabay.com,
                    media.istockphoto.com, i.pinimg.com, pinimg.com, pbs.twimg.com, twitter.com,
                    facebook.com, pinterest.com, scontent.xx.fbcdn.net, media.tumblr.com,
                    tumblr.com, media.giphy.com, giphy.com, cdn.discordapp.com, discordapp.com,
                    raw.githubusercontent.com, githubusercontent.com, static.wikia.nocookie.net,
                    wikimedia.org, upload.wikimedia.org
                  </span>
                  <br />
                  <span className="italic">Remember to make the image public!</span>
                </p>
              </div>
              {form.image !== original.image && (
                <button
                  type="button"
                  className="clear-btn clear-btn-center-y"
                  onClick={() => handleUndo('image')}
                >
                  Undo
                </button>
              )}
            </div>
            <div className="relative flex items-center gap-2">
              <div className="flex-1">
                <label htmlFor="pitch" className="form-label mb-3">
                  Complete Pitch Details
                  <Tooltip
                    text="100-10,000 characters, you can see the preview by clicking the eye icon"
                    position="right"
                  >
                    <Info className="info-icon" />
                  </Tooltip>
                </label>
                <MDEditor
                  className="form-input"
                  value={form.pitch}
                  onChange={handlePitchChange}
                  placeholder={'# Your Startup Pitch\n\n## Problem Statement\n\n## Solution etc.'}
                />
              </div>
              {form.pitch !== original.pitch && (
                <button
                  type="button"
                  className="clear-btn clear-btn-center-y"
                  onClick={() => handleUndo('pitch')}
                >
                  Undo
                </button>
              )}
            </div>
          </div>
          <div className="mt-12 flex justify-center gap-4 border-t border-muted pt-8">
            <button
              type="button"
              className="btn-normal bg-red-700 text-white ring-1 ring-ring hover:bg-red-600"
              disabled={isPending}
              onClick={() => setShowConfirm(true)}
            >
              Delete Startup
            </button>
            <button
              type="button"
              className="btn-normal bg-gray-600 text-white ring-1 ring-ring hover:bg-gray-500"
              disabled={isPending}
              onClick={() => router.push(`/startup/${startup.slug}`)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn-normal text-white ring-1 ring-ring hover:bg-green-600 ${isPending || isFormIncomplete ? 'cursor-not-allowed bg-gray-700' : 'bg-green-700'}`}
              disabled={isPending || isFormIncomplete}
            >
              {isPending ? (
                <>
                  <div className="mr-1 h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>Save Changes</>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default StartupUpdateForm;
