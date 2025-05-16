'use client';
import React from 'react';
import { useActionState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import { validateForm } from '@/lib/validation';
import { Textarea } from '@/components/ui/textarea';
import MDEditor from '../mike-mardown/src/MDEditor';
import { PlaneTakeoff } from 'lucide-react';
import { createPitch } from '@/lib/actions';
import Tooltip from './Tooltip';
import { Info } from 'lucide-react';
import { ImagePreview } from '@/components/ImageUtilities';

type FormState = {
  error: string;
  status: 'INITIAL' | 'SUCCESS' | 'ERROR';
  _id?: string;
  slug?: string;
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
  title: '',
  description: '',
  category: '',
  link: '',
  pitch: '',
};

function StartupForm() {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formValues, setFormValues] = React.useState(initialFormValues);
  const { pitch } = formValues;
  const { toast } = useToast();
  const router = useRouter();

  const [categoryInput, setCategoryInput] = React.useState('');
  const [showCategoryOptions, setShowCategoryOptions] = React.useState(false);
  const filteredCategories = React.useMemo(
    () =>
      officialCategories.filter((cat) => cat.toLowerCase().includes(categoryInput.toLowerCase())),
    [categoryInput]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handlePitchChange = (value: string | undefined) => {
    setFormValues((prev) => ({ ...prev, pitch: value || '' }));
  };

  const clearField = (field: keyof typeof formValues) => {
    setFormValues((prev) => ({ ...prev, [field]: '' }));
    if (field === 'category') setCategoryInput('');
  };

  const handleFormSubmit = async (prevState: FormState): Promise<FormState> => {
    const currentValues = { ...formValues };
    const fieldErrors = validateForm(currentValues) || {};
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast({
        title: 'Input Error',
        description: 'Please check your inputs and try again',
        variant: 'destructive',
      });
      return { ...prevState, error: '', status: 'ERROR' };
    }
    try {
      const validatedFormData = new FormData();
      Object.entries(currentValues).forEach(([key, value]) => {
        if (key !== 'pitch') validatedFormData.append(key, value);
      });
      const result = await createPitch(prevState, validatedFormData, currentValues.pitch);
      if (result && result.status === 'SUCCESS' && result._id) {
        toast({
          title: 'Success',
          description: 'Congratulations! Your new startup has been created!',
        });
        setFormValues(initialFormValues);
        setTimeout(() => {
          router.push(`/startup/${result.slug}`);
        }, 500);
      } else if (result && result.error) {
        toast({
          title: 'Submission Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Warning',
          description: 'Startup was created but there might be an issue with navigation',
          variant: 'destructive',
        });
      }
      return result;
    } catch (error) {
      console.error('Error creating pitch:', error);
      toast({
        title: 'Something went wrong',
        description: 'Please try again later.',
        variant: 'destructive',
      });
      return { ...prevState, error: '', status: 'ERROR' };
    }
  };

  const [, formAction, isPending] = useActionState(handleFormSubmit, {
    error: '',
    status: 'INITIAL',
  });

  // Disable submit if any required field is empty (image is optional)
  const isFormIncomplete =
    !formValues.title.trim() ||
    !formValues.description.trim() ||
    !formValues.category.trim() ||
    !formValues.pitch.trim();

  return (
    <form action={formAction} className="relative mx-auto max-w-3xl items-center">
      <div className="mx-10 grid items-center gap-8">
        <div className="relative">
          <label htmlFor="title" className="form-label">
            Project Name
            <Tooltip text="3-80 characters" position="right">
              <Info className="info-icon" />
            </Tooltip>
          </label>
          <div className="relative">
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              required
              placeholder="Enter a memorable name for your startup"
              value={formValues.title}
              onChange={handleInputChange}
            />
            {formValues.title && (
              <button
                type="button"
                className="clear-btn clear-btn-center-y"
                onClick={() => clearField('title')}
                tabIndex={-1}
              >
                Clear
              </button>
            )}
          </div>
          {errors.title && <p className="mt-1 text-sm font-medium text-red-500">{errors.title}</p>}
        </div>
        <div className="relative">
          <label htmlFor="description" className="form-label">
            Executive Summary
            <Tooltip text="20-500 characters" position="right">
              <Info className="info-icon" />
            </Tooltip>
          </label>
          <div className="relative">
            <Textarea
              id="description"
              name="description"
              className="form-input min-h-[120px]"
              required
              placeholder="Provide a concise summary of your startup concept (2-3 sentences)"
              value={formValues.description}
              onChange={handleInputChange}
            />
            {formValues.description && (
              <button
                type="button"
                className="clear-btn clear-btn-top-2"
                onClick={() => clearField('description')}
                tabIndex={-1}
              >
                Clear
              </button>
            )}
          </div>
          {errors.description && (
            <p className="mt-1 text-sm font-medium text-red-500">{errors.description}</p>
          )}
        </div>
        <div className="relative">
          <label htmlFor="category" className="form-label">
            Industry Category
            <Tooltip text="3-20 characters" position="right">
              <Info className="info-icon" />
            </Tooltip>
          </label>
          <div className="relative">
            <input
              type="text"
              id="category"
              name="category"
              className="form-input"
              required
              autoComplete="off"
              placeholder="Choose a category or enter your own"
              value={formValues.category}
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
            {formValues.category && (
              <button
                type="button"
                className="clear-btn clear-btn-center-y"
                onClick={() => clearField('category')}
                tabIndex={-1}
              >
                Clear
              </button>
            )}
          </div>
          {errors.category && (
            <p className="mt-1 text-sm font-medium text-red-500">{errors.category}</p>
          )}
        </div>
        <div className="relative">
          <label htmlFor="link" className="form-label">
            Image URL
            <Tooltip text="See allowed domains below" position="right">
              <Info className="info-icon" />
            </Tooltip>
          </label>
          <div className="relative">
            <input
              type="url"
              id="link"
              name="link"
              className="form-input"
              placeholder="(Optional) Enter a URL for your startup's image"
              value={formValues.link}
              onChange={handleInputChange}
            />
            {formValues.link && (
              <button
                type="button"
                className="clear-btn clear-btn-center-y"
                onClick={() => clearField('link')}
                tabIndex={-1}
              >
                Clear
              </button>
            )}
          </div>
          <div className="mt-2 flex h-40 w-full items-center justify-center rounded border bg-muted/10">
            <ImagePreview src={formValues.link} alt="Startup preview" />
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
          {errors.link && <p className="mt-1 text-sm font-medium text-red-500">{errors.link}</p>}
        </div>
        <div className="relative">
          <label htmlFor="pitch" className="form-label mb-3">
            Complete Pitch Details
            <Tooltip
              text="100-10,000 characters, you can see the preview by clicking the eye icon"
              position="right"
            >
              <Info className="info-icon" />
            </Tooltip>
          </label>
          <div className="relative">
            <MDEditor
              className="form-input"
              value={pitch}
              onChange={handlePitchChange}
              placeholder={'# Your Startup Pitch\n\n## Problem Statement\n\n## Solution etc.'}
            />
          </div>
          {errors.pitch && <p className="mt-1 text-sm font-medium text-red-500">{errors.pitch}</p>}
        </div>
      </div>
      <div className="mt-12 flex flex-col items-center justify-center border-t border-muted pt-8">
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
      </div>
    </form>
  );
}

export default StartupForm;
