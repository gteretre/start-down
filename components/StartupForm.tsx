'use client';
import React from 'react';
import { useActionState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import { validateForm } from '@/lib/validation';
import { Button } from './ui/button';
import { Textarea } from '@/components/ui/textarea';
import MDEditor from '@uiw/react-md-editor';
import { PlaneTakeoff } from 'lucide-react';
import { createPitch } from '@/lib/actions';
import Tooltip from './Tooltip';
import { Info } from 'lucide-react';

function StartupForm() {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formValues, setFormValues] = React.useState({
    title: '',
    description: '',
    category: '',
    link: '',
    pitch: '',
  });
  const { pitch } = formValues;
  const { toast } = useToast();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handlePitchChange = (value: string | undefined) => {
    setFormValues((prev) => ({ ...prev, pitch: value || '' }));
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = async (prevState: any) => {
    // Example: You can also get values from FormData if needed
    // const titleFromFormData = formData.get('title');
    // console.log('FormData title:', titleFromFormData);
    // (prevState, formData: FormData)

    // Use values from our state instead of directly from formData
    const currentValues = {
      title: formValues.title,
      description: formValues.description,
      category: formValues.category,
      link: formValues.link,
      pitch: formValues.pitch,
    };

    const fieldErrors = validateForm(currentValues);
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
      validatedFormData.append('title', currentValues.title);
      validatedFormData.append('description', currentValues.description);
      validatedFormData.append('category', currentValues.category);
      validatedFormData.append('link', currentValues.link);

      // Pass the validated FormData to the createPitch function
      const result = await createPitch(prevState, validatedFormData, currentValues.pitch);

      if (result && result.status === 'SUCCESS' && result._id) {
        toast({
          title: 'Success',
          description: 'Congratulations! Your new startup has been created!',
        });

        // Only reset form on success
        setFormValues({
          title: '',
          description: '',
          category: '',
          link: '',
          pitch: '',
        });

        // Add a small delay before redirecting to ensure database operation completes
        setTimeout(() => {
          router.push(`/startup/${result.slug}`);
        }, 1000);
      } else if (result && result.error) {
        // Show specific server error (e.g., forbidden name, duplicate, etc.)
        toast({
          title: 'Submission Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        // Handle case where result doesn't have expected structure
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
      return {
        ...prevState,
        error: '',
        status: 'ERROR',
      };
    }
  };

  const [, formAction, isPending] = useActionState(handleFormSubmit, {
    error: '',
    status: 'INITIAL',
  });
  const [colorMode, setColorMode] = React.useState('light');

  React.useEffect(() => {
    // Set initial color mode based on system preference or body class
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setColorMode(document.body.classList.contains('dark') || isDarkMode ? 'dark' : 'light');

    // Set up observer for theme changes
    const observer = new MutationObserver(() => {
      const isDark = document.body.classList.contains('dark');
      setColorMode(isDark ? 'dark' : 'light');
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);
  return (
    <form
      action={formAction}
      className="relative mx-auto my-16 max-w-3xl space-y-12 rounded-3xl border border-border bg-gradient-to-br from-blue-100 via-white to-blue-50 p-4 shadow-2xl dark:from-blue-950 dark:via-gray-900 dark:to-blue-900 md:p-10 lg:px-32"
    >
      <p className="mb-10 text-center text-xl text-muted-foreground md:text-xl">
        Fill out the form below to share your idea with the world. Make it bold, creative, and
        memorable!
      </p>
      <div className="grid gap-8">
        {/* Project Name */}
        <div className="form-section relative">
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
              placeholder="Enter a memorable name for your startup idea"
              value={formValues.title}
              onChange={handleInputChange}
            />
            {formValues.title && (
              <button
                type="button"
                className="clear-btn clear-btn-center-y"
                onClick={() => setFormValues((prev) => ({ ...prev, title: '' }))}
                tabIndex={-1}
              >
                Clear
              </button>
            )}
          </div>
          {errors.title && <p className="mt-1 text-sm font-medium text-red-500">{errors.title}</p>}
        </div>
        <div className="form-section relative">
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
                onClick={() => setFormValues((prev) => ({ ...prev, description: '' }))}
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
        <div className="form-section relative">
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
              placeholder="e.g., Tech, Health, Finance, Education"
              value={formValues.category}
              onChange={handleInputChange}
            />
            {formValues.category && (
              <button
                type="button"
                className="clear-btn clear-btn-center-y"
                onClick={() => setFormValues((prev) => ({ ...prev, category: '' }))}
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
        <div className="form-section relative">
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
                onClick={() => setFormValues((prev) => ({ ...prev, link: '' }))}
                tabIndex={-1}
              >
                Clear
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
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
        <div className="form-section relative" data-color-mode={colorMode}>
          <label htmlFor="pitch" className="form-label mb-3">
            Complete Pitch Details
            <Tooltip text="100-10,000 characters" position="right">
              <Info className="info-icon" />
            </Tooltip>
          </label>
          <div className="relative">
            <div className="overflow-hidden rounded-lg ring-1 ring-ring">
              <MDEditor
                value={pitch}
                onChange={handlePitchChange}
                height={500}
                id="pitch"
                preview="edit"
                style={{ borderRadius: 8, overflow: 'hidden' }}
                previewOptions={{ disallowedElements: ['style'] }}
                textareaProps={{
                  placeholder: '# Your Startup Pitch\n\n## Problem Statement\n\n## Solution etc.',
                  className: 'w-full',
                }}
              />
            </div>
            {pitch && (
              <button
                type="button"
                className="clear-btn clear-btn-top-2"
                onClick={() => setFormValues((prev) => ({ ...prev, pitch: '' }))}
                tabIndex={-1}
              >
                Clear
              </button>
            )}
          </div>
          {errors.pitch && <p className="mt-1 text-sm font-medium text-red-500">{errors.pitch}</p>}
        </div>
      </div>
      <div className="mt-12 flex justify-center border-t border-muted pt-8">
        <Button
          type="submit"
          className="flex min-w-[220px] transform items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-500 px-12 py-6 text-xl font-bold shadow-lg transition-all duration-300 hover:-translate-y-1 hover:from-purple-700 hover:to-blue-600 hover:shadow-2xl hover:shadow-purple-300/30 dark:from-purple-800 dark:to-blue-700 dark:hover:from-purple-900 dark:hover:to-blue-800 dark:hover:shadow-purple-900/30"
          disabled={isPending}
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
        </Button>
      </div>
    </form>
  );
}

export default StartupForm;
