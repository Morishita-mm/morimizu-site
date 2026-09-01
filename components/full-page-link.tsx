import type { ComponentPropsWithoutRef } from 'react';

type FullPageLinkProps = Omit<ComponentPropsWithoutRef<'a'>, 'href'> & {
  href: string;
};

/**
 * Uses native document navigation intentionally.
 * vinext's client router currently prevents internal Link navigation on Workers.
 */
export function FullPageLink({ children, href, ...props }: FullPageLinkProps) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
