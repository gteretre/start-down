"use client";
import React from "react";
import { useActionState } from "react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

import { Button } from "./ui/button";
import { Textarea } from "@/components/ui/textarea";
import MDEditor from "@uiw/react-md-editor";
import { PlaneTakeoff } from "lucide-react";
import { formSchema } from "@/lib/validation";
import { createPitch } from "@/lib/actions";

function StartupForm() {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pitch, setPitch] = React.useState("");
  const { toast } = useToast();
  const router = useRouter();

  const handleFormSubmit = async (prevState: any, formData: FormData) => {
    try {
      const formValues = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        link: formData.get("link") as string,
        pitch
      };
      await formSchema.parseAsync(formValues);
      const result = await createPitch(prevState, formData, pitch);
      if (result.status == "SUCCESS") {
        toast({
          title: "Success",
          description: "Congratulations! Your new startup has been created!"
        });
      }
      router.push("/startup/${result._id}");
      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        setErrors(fieldErrors as unknown as Record<string, string>);
        toast({
          title: "Input Error",
          description: "Please check Your inputs and try again",
          variant: "destructive"
        });
        return { ...prevState, error: "Validation failed", status: "ERROR" };
      }
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

  const [colorMode, setColorMode] = React.useState(
    // document.body.classList.contains("dark") ? "dark" : "light"
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );
  React.useEffect(() => {
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
      className="articleBox max-w-2xl mx-auto my-10 space-y-8 px-6 "
    >
      <div>
        <label htmlFor="title" className="form-label">
          Name Your Idea
        </label>
        <input
          type="text"
          id="title"
          name="title"
          className="form-input"
          required
          placeholder="Make the failure original and memorable"
        />
        {errors.title && (
          <p className="text-red-500 px-5" style={{ fontSize: "0.85rem" }}>
            {errors.title}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="description" className="form-label">
          Put Some Description
        </label>
        <Textarea
          id="description"
          name="description"
          className="form-input"
          required
          placeholder="Describe you weirdest thoughts to catch the attention"
        />

        {errors.description && (
          <p className="text-red-500 px-5" style={{ fontSize: "0.85rem" }}>
            {errors.description}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="category" className="form-label">
          Categorize Your Suffering
        </label>
        <input
          type="category"
          id="category"
          name="category"
          className="form-input"
          required
          placeholder={`Just write "tech" or something...`}
        />

        {errors.category && (
          <p className="text-red-500 px-5" style={{ fontSize: "0.85rem" }}>
            {errors.category}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="link" className="form-label">
          Paint The Vision
        </label>
        <input
          type="link"
          id="link"
          name="link"
          className="form-input"
          required
          placeholder="Insert the valid link to Your photo"
        />

        {errors.link && (
          <p className="text-red-500 px-5" style={{ fontSize: "0.85rem" }}>
            {errors.link}
          </p>
        )}
      </div>
      <div data-color-mode={colorMode}>
        <label htmlFor="pitch" className="text-xl form-label">
          Show The World Everything You&apos;ve Got
        </label>
        <div className="ring-2 ring-ring rounded-2xl">
          <MDEditor
            value={pitch}
            onChange={(value) => setPitch(value as string)}
            height={500}
            id="pitch"
            preview="edit"
            style={{ borderRadius: 20, overflow: "hidden" }}
            previewOptions={{ disallowedElements: ["style"] }}
            textareaProps={{
              placeholder:
                "Failure is just another step toward the success!\n\nDescribe Your new idea with as many details as You want."
            }}
          />
        </div>

        {errors.pitch && (
          <p className="text-red-500 px-5" style={{ fontSize: "0.85rem" }}>
            {errors.pitch}
          </p>
        )}
      </div>
      <Button type="submit" className="search-btn">
        {isPending ? "Processing Form... " : "Submit My Terrible Idea!"}
        <PlaneTakeoff />
      </Button>
    </form>
  );
}

export default StartupForm;
