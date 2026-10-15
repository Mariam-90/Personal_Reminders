import { hasCaregiver, telLink, whatsappLink } from './caregiver';

describe('caregiver links', () => {
  it('builds a tel: link from a formatted number', () => {
    expect(telLink('050-123 4567')).toBe('tel:0501234567');
    expect(telLink('')).toBeNull();
  });

  it('converts Israeli numbers for WhatsApp', () => {
    expect(whatsappLink('050-1234567', 'היי')).toBe(`https://wa.me/972501234567?text=${encodeURIComponent('היי')}`);
    expect(whatsappLink('+972 50 1234567', 'a')).toBe('https://wa.me/972501234567?text=a');
  });

  it('knows when a caregiver is set', () => {
    expect(hasCaregiver({ caregiverPhone: '050' })).toBe(true);
    expect(hasCaregiver({ caregiverPhone: '' })).toBe(false);
    expect(hasCaregiver(null)).toBe(false);
  });
});
