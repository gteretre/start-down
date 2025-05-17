import * as React from 'react';

import { mergeCssClasses } from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return <textarea className={mergeCssClasses(className)} ref={ref} {...props} />;
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
