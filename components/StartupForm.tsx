'use client';
import React from 'react';
import { useActionState } from 'react';
import { validateForm } from '@/lib/validation';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

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
        description: 'Please check Your inputs and try again',
        variant: 'destructive',
      });
      return { ...prevState, error: 'Validation failed', status: 'ERROR' };
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
          router.push(`/startup/${result._id}`);
        }, 1000);
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
        title: 'Input Error',
        description: 'An unexpected error occured',
        variant: 'destructive',
      });
      return {
        ...prevState,
        error: 'An unexpected error occured',
        status: 'ERROR',
      };
    }
  };

  const [state, formAction, isPending] = useActionState(handleFormSubmit, {
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
      className="articleBox mx-auto my-12 max-w-3xl space-y-10 rounded-xl bg-card p-8 px-8 shadow-md"
    >
      <h2 className="mb-6 text-center text-2xl font-bold">Create Your Startup Pitch</h2>{' '}
      <div className="form-section">
        <label
          htmlFor="title"
          className="form-label mb-2 flex items-center gap-2 text-lg font-medium"
        >
          Project Name
          <Tooltip text="3-80 characters" position="right">
            <Info className="inline h-4 w-4 cursor-pointer text-muted-foreground" />
          </Tooltip>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          className="form-input w-full transition-all duration-200 focus:ring-2"
          required
          placeholder="Enter a memorable name for your startup idea"
          value={formValues.title}
          onChange={handleInputChange}
        />
        {errors.title && <p className="mt-1 text-sm font-medium text-red-500">{errors.title}</p>}
      </div>
      <div className="form-section">
        <label
          htmlFor="description"
          className="form-label mb-2 flex items-center gap-2 text-lg font-medium"
        >
          Executive Summary
          <Tooltip text="20-500 characters" position="right">
            <Info className="inline h-4 w-4 cursor-pointer text-muted-foreground" />
          </Tooltip>
        </label>
        <Textarea
          id="description"
          name="description"
          className="form-input min-h-[120px] transition-all duration-200 focus:ring-2"
          required
          placeholder="Provide a concise summary of your startup concept (2-3 sentences)"
          value={formValues.description}
          onChange={handleInputChange}
        />
        {errors.description && (
          <p className="mt-1 text-sm font-medium text-red-500">{errors.description}</p>
        )}
      </div>
      <div className="form-section">
        <label
          htmlFor="category"
          className="form-label mb-2 flex items-center gap-2 text-lg font-medium"
        >
          Industry Category
          <Tooltip text="3-20 characters" position="right">
            <Info className="inline h-4 w-4 cursor-pointer text-muted-foreground" />
          </Tooltip>
        </label>
        <input
          type="text"
          id="category"
          name="category"
          className="form-input transition-all duration-200 focus:ring-2"
          required
          placeholder="e.g., Tech, Health, Finance, Education"
          value={formValues.category}
          onChange={handleInputChange}
        />
        {errors.category && (
          <p className="mt-1 text-sm font-medium text-red-500">{errors.category}</p>
        )}
      </div>
      <div className="form-section">
        <label
          htmlFor="link"
          className="form-label mb-2 flex items-center gap-2 text-lg font-medium"
        >
          Image URL
          <Tooltip
            text={`Allowed domains:
          placehold.co, drive.google.com, docs.google.com, photos.google.com,
          dl.dropboxusercontent.com, onedrive.live.com, icloud.com, i.imgur.com,
          live.staticflickr.com, *.s3.amazonaws.com, www.dropbox.com`}
            position="right"
            multiline={true}
          >
            <Info className="inline h-4 w-4 cursor-pointer text-muted-foreground" />
          </Tooltip>
        </label>
        <input
          type="url"
          id="link"
          name="link"
          className="form-input transition-all duration-200 focus:ring-2"
          placeholder="(Optional) Enter a URL for your startup's image"
          value={formValues.link}
          onChange={handleInputChange}
        />
        {errors.link && <p className="mt-1 text-sm font-medium text-red-500">{errors.link}</p>}
      </div>
      <div className="form-section" data-color-mode={colorMode}>
        <label htmlFor="pitch" className="mb-3 flex items-center gap-2 text-lg font-medium">
          Complete Pitch Details
          <Tooltip text="100-10,000 characters" position="right">
            <Info className="inline h-4 w-4 cursor-pointer text-muted-foreground" />
          </Tooltip>
        </label>{' '}
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
            }}
          />
        </div>
        {errors.pitch && <p className="mt-1 text-sm font-medium text-red-500">{errors.pitch}</p>}
        {state.error && <p className="mt-2 text-sm font-medium text-red-500">{state.error}</p>}
      </div>{' '}
      <div className="mt-8 flex justify-center border-t border-muted pt-6">
        <Button
          type="submit"
          className="flex min-w-[220px] transform items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 px-10 py-5 text-lg font-semibold transition-all duration-300 hover:-translate-y-1 hover:from-purple-700 hover:to-blue-600 hover:shadow-lg hover:shadow-purple-300/30 dark:from-purple-800 dark:to-blue-700 dark:hover:from-purple-900 dark:hover:to-blue-800 dark:hover:shadow-purple-900/30"
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
