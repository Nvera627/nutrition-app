import { useEffect } from 'react';

/**
 * Sets the browser tab title for the current page.
 * Usage: usePageTitle('Dashboard')  →  tab shows "Dashboard | BalanceBite"
 */
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | BalanceBite` : 'BalanceBite';
  }, [title]);
}
