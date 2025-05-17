'use client';
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { PlaneTakeoff, Info } from 'lucide-react';

import { validateForm } from '@/lib/validation';
import { Textarea } from '@/components/ui/textarea';
import MDEditor from '@/mike-mardown/src/MDEditor';
import Tooltip from '@/components/common/Tooltip';
import { ImagePreview } from '@/components/ImageUtilities';
import Confirmation from '@/components/common/Confirmation';

type StartupResponse = {
  _id?: string;
  slug?: string;
  status?: string;
  error?: string;
};

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

const initialFormValues = {
  slug: '',
  title: '',
  description: '',
  category: '',
  image: '',
  pitch: '',
};

// Helper for rendering a form field with label, tooltip, input, error, and clear/undo logic
function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  tooltip,
  error,
  mode,
  originalValue,
  clearField,
  handleUndo,
  readOnly = false,
  disabled = false,
  inputProps = {},
  children,
}: {
  label: string;
  name: keyof typeof initialFormValues;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  tooltip?: string;
  error?: string;
  mode: 'create' | 'edit';
  originalValue: string;
  clearField: (field: keyof typeof initialFormValues) => void;
  handleUndo: (field: keyof typeof initialFormValues) => void;
  readOnly?: boolean;
  disabled?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <label htmlFor={name} className="form-label">
        {label}
        {tooltip && (
          <Tooltip text={tooltip} position="right">
            <Info className="info-icon" />
          </Tooltip>
        )}
      </label>
      <div className="relative">
        <input
          type={type}
          id={name}
          name={name}
          className="form-input"
          required
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          disabled={disabled}
          autoComplete="off"
          {...inputProps}
        />
        {mode === 'create' && value && (
          <button
            type="button"
            className="clear-btn clear-btn-center-y"
            onClick={() => clearField(name)}
            tabIndex={-1}
          >
            Clear
          </button>
        )}
        {mode === 'edit' && value !== originalValue && (
          <button
            type="button"
            className="clear-btn clear-btn-center-y"
            onClick={() => handleUndo(name)}
            tabIndex={-1}
          >
            Undo
          </button>
        )}
        {children}
      </div>
      {error && <p className="mt-1 text-sm font-medium text-red-500">{error}</p>}
    </div>
  );
}

// Helper for textarea and MDEditor fields
function TextAreaField({
  label,
  name,
  value,
  tooltip,
  error,
  mode,
  originalValue,
  clearField,
  handleUndo,
  children,
}: {
  label: string;
  name: keyof typeof initialFormValues;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  tooltip?: string;
  error?: string;
  mode: 'create' | 'edit';
  originalValue: string;
  clearField: (field: keyof typeof initialFormValues) => void;
  handleUndo: (field: keyof typeof initialFormValues) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <label htmlFor={name} className="form-label">
        {label}
        {tooltip && (
          <Tooltip text={tooltip} position="right">
            <Info className="info-icon" />
          </Tooltip>
        )}
      </label>
      <div className="relative">
        {children}
        {mode === 'create' && value && (
          <button
            type="button"
            className="clear-btn clear-btn-top-2"
            onClick={() => clearField(name)}
            tabIndex={-1}
          >
            Clear
          </button>
        )}
        {mode === 'edit' && value !== originalValue && (
          <button
            type="button"
            className="clear-btn clear-btn-top-2"
            onClick={() => handleUndo(name)}
            tabIndex={-1}
          >
            Undo
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm font-medium text-red-500">{error}</p>}
    </div>
  );
}

function StartupForm({
  mode = 'create',
  initialValues,
  startupId,
  startupSlug,
  onDelete,
}: {
  mode?: 'create' | 'edit';
  initialValues?: typeof initialFormValues;
  startupId?: string;
  startupSlug?: string;
  onDelete?: () => void;
} = {}) {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formValues, setFormValues] = React.useState(initialValues || initialFormValues);
  const originalValues = React.useRef(initialValues || initialFormValues);
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  const [categoryInput, setCategoryInput] = React.useState(formValues.category || '');
  const [showCategoryOptions, setShowCategoryOptions] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const filteredCategories = React.useMemo(
    () =>
      officialCategories.filter((cat) => cat.toLowerCase().includes(categoryInput.toLowerCase())),
    [categoryInput]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const clearField = (field: keyof typeof formValues) => {
    setFormValues((prev) => ({ ...prev, [field]: '' }));
    if (field === 'category') setCategoryInput('');
  };

  const handleUndo = (field: keyof typeof formValues) => {
    setFormValues((prev) => ({ ...prev, [field]: originalValues.current[field] }));
    if (field === 'category') setCategoryInput(originalValues.current.category);
  };

  const isFormIncomplete =
    !formValues.title.trim() ||
    !formValues.description.trim() ||
    !formValues.category.trim() ||
    !formValues.pitch.trim();

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrors({});
    const currentValues = { ...formValues };
    const fieldErrors = validateForm(currentValues) || {};
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast({
        title: 'Input Error',
        description: 'Please check your inputs and try again',
        variant: 'destructive',
      });
      setIsPending(false);
      return;
    }
    try {
      let response, data: StartupResponse;
      if (mode === 'create') {
        response = await fetch('/api/startups', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...currentValues, image: currentValues.image }),
        });
        data = await response.json();
        if (response.ok && data.status === 'SUCCESS' && data.slug) {
          toast({
            title: 'Success',
            description: 'Congratulations! Your new startup has been created!',
          });
          setFormValues(initialFormValues);
          setTimeout(() => {
            router.push(`/startup/${data.slug}`);
          }, 500);
        } else {
          toast({
            title: 'Submission Error',
            description: data.error || 'Failed to create startup.',
            variant: 'destructive',
          });
        }
      } else if (mode === 'edit' && startupId) {
        response = await fetch(`/api/startups/${startupId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: currentValues.description,
            category: currentValues.category,
            image: currentValues.image,
            pitch: currentValues.pitch,
          }),
        });
        data = await response.json();
        if (response.ok && data.status === 'SUCCESS') {
          toast({ title: 'Success', description: 'Startup updated!' });
          if (startupSlug) router.push(`/startup/${startupSlug}`);
        } else {
          toast({
            title: 'Update Error',
            description: data.error || 'Failed to update startup.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Something went wrong',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
    setIsPending(false);
  };

  const handleDelete = async () => {
    if (!startupId) return;
    setIsPending(true);
    try {
      const response = await fetch(`/api/startups/${startupId}`, { method: 'DELETE' });
      const data = await response.json();
      if (response.ok && data.success) {
        toast({ title: 'Deleted', description: data.message });
        if (onDelete) onDelete();
        router.push('/');
      } else {
        toast({
          title: 'Delete Error',
          description: data.message || 'Failed to delete.',
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
  };

  return (
    <form onSubmit={handleFormSubmit} className="relative mx-auto max-w-3xl items-center">
      <Confirmation
        open={showConfirm}
        onConfirmAction={handleDelete}
        onCancelAction={() => setShowConfirm(false)}
        title="Confirm Deletion of the startup"
        message="This action cannot be undone. To confirm, type the word below:"
      />
      <div className="mx-10 grid items-center gap-8">
        <FormField
          label="Project Name"
          name="title"
          value={formValues.title}
          onChange={(e) => handleInputChange(e)}
          placeholder="Enter a memorable name for your startup"
          tooltip={mode === 'edit' ? 'Cannot change the name' : '3-80 characters'}
          error={errors.title}
          mode={mode}
          originalValue={originalValues.current.title}
          clearField={clearField}
          handleUndo={handleUndo}
          readOnly={mode === 'edit'}
          disabled={mode === 'edit'}
          inputProps={{ autoComplete: 'off' }}
        />
        <TextAreaField
          label="Executive Summary"
          name="description"
          value={formValues.description}
          onChange={(val) => setFormValues((prev) => ({ ...prev, description: val }))}
          placeholder="Provide a concise summary of your startup concept (2-3 sentences)"
          tooltip="20-500 characters"
          error={errors.description}
          mode={mode}
          originalValue={originalValues.current.description}
          clearField={clearField}
          handleUndo={handleUndo}
        >
          <Textarea
            id="description"
            name="description"
            className="form-input min-h-[120px]"
            required
            autoComplete="off"
            placeholder="Provide a concise summary of your startup concept (2-3 sentences)"
            value={formValues.description}
            onChange={(e) => {
              setFormValues((prev) => ({ ...prev, description: e.target.value }));
            }}
          />
        </TextAreaField>
        <FormField
          label="Industry Category"
          name="category"
          value={formValues.category}
          onChange={(e) => {
            handleInputChange(e);
            setCategoryInput(e.target.value);
            setShowCategoryOptions(true);
          }}
          placeholder="Choose a category or enter your own"
          tooltip="3-20 characters"
          error={errors.category}
          mode={mode}
          originalValue={originalValues.current.category}
          clearField={clearField}
          handleUndo={handleUndo}
          inputProps={{ autoComplete: 'off' }}
        >
          {showCategoryOptions && filteredCategories.length > 0 && (
            <ul className="bordershadow-lg absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md bg-secondary">
              {filteredCategories.map((cat) => (
                <li
                  key={cat}
                  className="cursor-pointer px-4 py-2 hover:bg-blue-400"
                  onMouseDown={() => {
                    setFormValues((prev) => ({ ...prev, category: cat }));
                    setCategoryInput(cat);
                    setShowCategoryOptions(false);
                  }}
                >
                  {cat}
                </li>
              ))}
            </ul>
          )}
        </FormField>
        <FormField
          label="Image URL"
          name="image"
          type="url"
          value={formValues.image}
          onChange={(e) => handleInputChange(e)}
          placeholder="(Optional) Enter a URL for your startup's image"
          tooltip="See allowed domains below"
          error={errors.image}
          mode={mode}
          originalValue={originalValues.current.image}
          clearField={clearField}
          handleUndo={handleUndo}
          inputProps={{ autoComplete: 'off' }}
        >
          <div className="mt-2 flex h-40 w-full items-center justify-center rounded border bg-muted/10">
            <ImagePreview src={formValues.image} alt="Startup preview" />
          </div>
          <p className="mx-10 mt-2 text-xs text-muted-foreground">
            Allowed domains:{' '}
            <span className="whitespace-normal break-words">
              placehold.co, drive.google.com, docs.google.com, photos.google.com,
              dl.dropboxusercontent.com, onedrive.live.com, icloud.com, i.imgur.com,
              live.staticflickr.com, *.s3.amazonaws.com, www.dropbox.com, imgur.com, imgbb.com,
              images.unsplash.com, unsplash.com, cdn.pixabay.com, pixabay.com,
              media.istockphoto.com, i.pinimg.com, pinimg.com, pbs.twimg.com, twitter.com,
              facebook.com, pinterest.com, scontent.xx.fbcdn.net, media.tumblr.com, tumblr.com,
              media.giphy.com, giphy.com, cdn.discordapp.com, discordapp.com,
              raw.githubusercontent.com, githubusercontent.com, static.wikia.nocookie.net,
              wikimedia.org, upload.wikimedia.org
            </span>
            <br />
            <span className="italic">Remember to make the image public!</span>
          </p>
        </FormField>
        <TextAreaField
          label="Complete Pitch Details"
          name="pitch"
          value={formValues.pitch}
          onChange={(val) => setFormValues((prev) => ({ ...prev, pitch: val }))}
          placeholder={'# Your Startup Pitch\n\n## Problem Statement\n\n## Solution etc.'}
          tooltip="100-10,000 characters, you can see the preview by clicking the eye icon"
          error={errors.pitch}
          mode={mode}
          originalValue={originalValues.current.pitch}
          clearField={clearField}
          handleUndo={handleUndo}
        >
          <MDEditor
            className="form-input"
            value={formValues.pitch}
            onChange={(val) => setFormValues((prev) => ({ ...prev, pitch: val || '' }))}
            placeholder={'# Your Startup Pitch\n\n## Problem Statement\n\n## Solution etc.'}
          />
        </TextAreaField>
      </div>
      <div className="mt-12 flex flex-col items-center justify-center border-t border-muted pt-8">
        {mode === 'create' && (
          <>
            <button
              type="submit"
              className="flex min-w-[220px] transform items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-500 px-12 py-6 text-xl font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:from-purple-700 hover:to-blue-600 hover:shadow-2xl hover:shadow-purple-300/30 dark:from-purple-800 dark:to-blue-700 dark:hover:from-purple-900 dark:hover:to-blue-800 dark:hover:shadow-purple-900/30"
              disabled={isPending || isFormIncomplete}
            >
              {isPending ? (
                <>
                  <div className="mr-1 h-5 w-5 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  Submit Pitch
                  <PlaneTakeoff className="h-5 w-5" />
                </>
              )}
            </button>
            {(isPending || isFormIncomplete) && (
              <p className="mt-2 text-sm text-gray-500">
                {isPending
                  ? 'Please wait while your pitch is being submitted...'
                  : 'Please fill in all required fields to submit.'}
              </p>
            )}
          </>
        )}
        {mode === 'edit' && (
          <div className="mb-8 flex flex-row items-center justify-center gap-4">
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
              onClick={() => router.push(`/startup/${initialFormValues.slug}`)}
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
        )}
      </div>
    </form>
  );
}

export default StartupForm;
