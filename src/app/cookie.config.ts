import { NgcCookieConsentConfig } from 'ngx-cookieconsent';

// Restored from the original site's cookie-consent banner: black popup, red
// "#ff2600" buttons, opt-out type, with a single message linking to the policy.
export const cookieConfig: NgcCookieConsentConfig = {
  cookie: {
    domain: typeof window !== 'undefined' ? window.location.hostname : '',
  },
  palette: {
    popup: { background: '#000' },
    button: { background: '#ff2600' },
  },
  theme: 'classic',
  type: 'opt-out',
  animateRevokable: true,
  layout: 'my-custom-layout',
  layouts: {
    'my-custom-layout': '{{messagelink}}{{compliance}}',
  },
  elements: {
    messagelink: `
    <span id="cookieconsent:desc" class="cc-message">{{message}}
      <a aria-label="learn more about cookies" tabindex="0" class="cc-link" href="{{cookiePolicyHref}}" rel="noopener">{{cookiePolicyLink}}</a>
    </span>`,
  },
  content: {
    message: 'By using our site, you acknowledge that you have read and understand our ',
    cookiePolicyLink: 'Cookie Policy',
    cookiePolicyHref: '/cookies',
    privacyPolicyLink: 'Privacy Policy',
    privacyPolicyHref: '/policy',
    tosLink: 'Terms and Conditions',
    tosHref: '/policy',
  },
};
