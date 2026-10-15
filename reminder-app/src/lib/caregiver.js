// Helpers for reaching the caregiver / family contact saved in the profile.

const digits = (phone) => String(phone || '').replace(/[^\d+]/g, '');

export const telLink = (phone) => (digits(phone) ? `tel:${digits(phone)}` : null);

// wa.me needs an international number without "+"; Israeli 05x numbers become 9725x.
export function whatsappLink(phone, message) {
  let num = digits(phone).replace(/^\+/, '');
  if (!num) return null;
  if (num.startsWith('0')) num = `972${num.slice(1)}`;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export const hasCaregiver = (user) => Boolean(user && digits(user.caregiverPhone));
