"use client";
import React from "react";
import { useActionState } from "react";
import { validateForm } from "@/lib/validation";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

import { Button } from "./ui/button";
import { Textarea } from "@/components/ui/textarea";
import MDEditor from "@uiw/react-md-editor";
import { PlaneTakeoff } from "lucide-react";
import { createPitch } from "@/lib/actions";

function StartupForm() {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formValues, setFormValues] = React.useState({
    title: "",
    description: "",
    category: "",
    link: "",
    pitch: ""
  });
  const { pitch } = formValues;
  const { toast } = useToast();
  const router = useRouter();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handlePitchChange = (value: string | undefined) => {
    setFormValues((prev) => ({ ...prev, pitch: value || "" }));
  };
  const handleFormSubmit = async (prevState: any, formData: FormData) => {
    // Use values from our state instead of directly from formData
    const currentValues = {
      title: formValues.title,
      description: formValues.description,
      category: formValues.category,
      link: formValues.link,
      pitch: formValues.pitch
    };

    const fieldErrors = validateForm(currentValues);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast({
        title: "Input Error",
        description: "Please check Your inputs and try again",
        variant: "destructive"
      });
      return { ...prevState, error: "Validation failed", status: "ERROR" };
    }

    try {
      const validatedFormData = new FormData();
      validatedFormData.append("title", currentValues.title);
      validatedFormData.append("description", currentValues.description);
      validatedFormData.append("category", currentValues.category);
      validatedFormData.append("link", currentValues.link);

      // Pass the validated FormData to the createPitch function
      const result = await createPitch(
        prevState,
        validatedFormData,
        currentValues.pitch
      );

      if (result && result.status === "SUCCESS" && result._id) {
        toast({
          title: "Success",
          description: "Congratulations! Your new startup has been created!"
        });

        // Only reset form on success
        setFormValues({
          title: "",
          description: "",
          category: "",
          link: "",
          pitch: ""
        });

        // Add a small delay before redirecting to ensure database operation completes
        setTimeout(() => {
          router.push(`/startup/${result._id}`);
        }, 1000);
      } else {
        // Handle case where result doesn't have expected structure
        toast({
          title: "Warning",
          description:
            "Startup was created but there might be an issue with navigation",
          variant: "destructive"
        });
      }

      return result;
    } catch (error) {
      toast({
        title: "Input Error",
        description: "An unexpected error occured",
        variant: "destructive"
      });
      return {
        ...prevState,
        error: "An unexpected error occured",
        status: "ERROR"
      };
    }
  };

  const [state, formAction, isPending] = useActionState(handleFormSubmit, {
    error: "",
    status: "INITIAL"
  });
  const [colorMode, setColorMode] = React.useState("light");

  React.useEffect(() => {
    // Set initial color mode based on system preference or body class
    const isDarkMode = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setColorMode(
      document.body.classList.contains("dark") || isDarkMode ? "dark" : "light"
    );

    // Set up observer for theme changes
    const observer = new MutationObserver(() => {
      const isDark = document.body.classList.contains("dark");
      setColorMode(isDark ? "dark" : "light");
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"]
    });

    return () => observer.disconnect();
  }, []);
  return (
    <form
      action={formAction}
      className="articleBox max-w-3xl mx-auto my-12 space-y-10 px-8 shadow-md rounded-xl bg-card p-8"
    >
      <h2 className="text-2xl font-bold text-center mb-6">
        Create Your Startup Pitch
      </h2>{" "}
      <div className="form-section">
        <label
          htmlFor="title"
          className="form-label text-lg font-medium mb-2 block"
        >
          Project Name
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
        {errors.title && (
          <p className="text-red-500 mt-1 text-sm font-medium">
            {errors.title}
          </p>
        )}
      </div>
      <div className="form-section">
        <label
          htmlFor="description"
          className="form-label text-lg font-medium mb-2 block"
        >
          Executive Summary
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
          <p className="text-red-500 mt-1 text-sm font-medium">
            {errors.description}
          </p>
        )}
      </div>
      <div className="form-section">
        <label
          htmlFor="category"
          className="form-label text-lg font-medium mb-2 block"
        >
          Industry Category
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
          <p className="text-red-500 mt-1 text-sm font-medium">
            {errors.category}
          </p>
        )}
      </div>
      <div className="form-section">
        <label
          htmlFor="link"
          className="form-label text-lg font-medium mb-2 block"
        >
          Image URL
        </label>
        <input
          type="url"
          id="link"
          name="link"
          className="form-input transition-all duration-200 focus:ring-2"
          placeholder="(Optional) Enter a URL for your startup's featured image"
          value={formValues.link}
          onChange={handleInputChange}
        />
        {errors.link && (
          <p className="text-red-500 mt-1 text-sm font-medium">{errors.link}</p>
        )}
      </div>
      <div className="form-section" data-color-mode={colorMode}>
        <label htmlFor="pitch" className="text-lg font-medium mb-3 block">
          Complete Pitch Details
        </label>{" "}
        <div className="ring-1 ring-ring rounded-lg overflow-hidden">
          <MDEditor
            value={pitch}
            onChange={handlePitchChange}
            height={500}
            id="pitch"
            preview="edit"
            style={{ borderRadius: 8, overflow: "hidden" }}
            previewOptions={{ disallowedElements: ["style"] }}
            textareaProps={{
              placeholder:
                "# Your Startup Pitch\n\n## Problem Statement\n\n## Solution\n\n## Market Opportunity\n\n## Business Model\n\nDescribe your startup concept in detail here..."
            }}
          />
        </div>
        {errors.pitch && (
          <p className="text-red-500 mt-1 text-sm font-medium">
            {errors.pitch}
          </p>
        )}
        {state.error && (
          <p className="text-red-500 mt-2 text-sm font-medium">{state.error}</p>
        )}
      </div>{" "}
      <div className="flex justify-center mt-8 pt-6 border-t border-muted">
        <Button
          type="submit"
          className="px-10 py-5 text-lg font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition-all duration-300 hover:shadow-lg hover:shadow-purple-300/30 dark:from-purple-800 dark:to-blue-700 dark:hover:from-purple-900 dark:hover:to-blue-800 dark:hover:shadow-purple-900/30 transform hover:-translate-y-1 flex items-center justify-center gap-3 min-w-[220px]"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-1"></div>
              Processing...
            </>
          ) : (
            <>
              Submit Pitch
              <PlaneTakeoff className="w-5 h-5" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default StartupForm;
