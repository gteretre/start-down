import { allowedImageDomains } from './allowedDomains';

function isAllowedDomain(url: string) {
  try {
    const { hostname } = new URL(url);
    return allowedImageDomains.some((domain) =>
      typeof domain === 'string'
        ? hostname === domain
        : domain instanceof RegExp
          ? domain.test(hostname)
          : false
    );
  } catch {
    return false;
  }
}

export function validateForm(values: {
  title: string;
  description: string;
  category: string;
  link: string;
  pitch: string;
}) {
  const errors: Record<string, string> = {};

  // Allow unicode letters, numbers, spaces, dashes, and underscores
  const validNameRegex = /^[\p{L}0-9 _-]+$/u;

  if (!values.title || values.title.length < 3 || values.title.length > 80) {
    errors.title = 'Title must be between 3 and 80 characters.';
  } else if (!validNameRegex.test(values.title)) {
    errors.title =
      'Title can only contain letters (including accents), numbers, spaces, dashes, and underscores.';
  }

  if (!values.description || values.description.length < 20 || values.description.length > 500) {
    errors.description = 'Description must be between 20 and 500 characters.';
  }

  if (!values.category || values.category.length < 3 || values.category.length > 20) {
    errors.category = 'Category must be between 3 and 20 characters.';
  } else if (!validNameRegex.test(values.category)) {
    errors.category =
      'Category can only contain letters (including accents), numbers, spaces, dashes, and underscores.';
  }

  if (values.link) {
    try {
      const url = new URL(values.link);
      if (!/^https?:/.test(url.protocol)) {
        errors.link = 'Link must be a valid URL.';
      } else if (!isAllowedDomain(values.link)) {
        errors.link = 'Image domain is not allowed.';
      }
    } catch {
      errors.link = 'Link must be a valid URL.';
    }

    if (!values.pitch || values.pitch.length < 100 || values.pitch.length > 10000) {
      errors.pitch = 'Pitch must be between 100 and 10000 characters.';
    }

    return errors;
  }
}
