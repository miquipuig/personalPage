// Legal copy for the /policy, /terms and /cookies pages, restored verbatim from
// the original site build. Rendered as Markdown by PolicyComponent.

export type PolicyDoc = 'privacy' | 'terms' | 'cookie';

const privacy = `# Privacy Policy for miquelpuig.studio

**Effective Date: July 4, 2024**

## 1. Introduction
Welcome to miquelpuig.studio. This privacy policy outlines our practices concerning the collection, use, and protection of personal information. Your privacy is paramount to us, and we are committed to safeguarding your personal data.

## 2. Information We Collect
- **Through Forms and Google OAuth**: We collect names, email addresses, profile pictures, physical addresses, and phone numbers.
- **Cookies and Tracking**: We use cookies to manage session control and utilize Google Analytics for site traffic analysis.

## 3. Use of Your Information
The information you provide is essential for delivering personalized services and improving your interaction with our site. It helps us:
- Manage and authenticate your access
- Enhance user experience
- Provide customer support and respond to inquiries

## 4. Data Storage and Security
Your information is securely stored and protected against unauthorized access. We employ robust security measures such as:
- Encryption of sensitive data
- Secure servers
- Regular audits to improve security practices

## 5. Sharing of Information
We do not share your personal information with third parties, ensuring that your data remains confidential and is used only for the purposes stated herein.

## 6. Your Privacy Rights
You have the right to:
- Access the personal information we hold about you
- Request correction of inaccurate information
- Delete your data from our systems

To exercise these rights, please contact us through the methods provided below.

## 7. Third-Party Services
We utilize Google Analytics to analyze website usage. This service may access non-personally identifiable information related to your interaction with our website. For detailed information on Google Analytics' privacy practices, please refer to their privacy policy.

## 8. Children's Privacy
We do not knowingly collect personal information from children under the age of 13. If we learn that we have collected personal information from a child under 13, we will take steps to delete the information as soon as possible.

## 9. Changes to This Privacy Policy
We may update this policy periodically to reflect changes in our practices or relevant regulations. We recommend that you review this page regularly to stay informed about how we are protecting your information.

## 10. Contact Us
If you have any questions about this privacy policy or our treatment of your personal information, please contact us via:
- **Email**: [info@miquelpuig.studio](mailto:info@miquelpuig.studio)
- **Contact Form**: [https://miquelpuig.studio/contact](https://miquelpuig.studio/contact)
`;

const terms = `# Terms of Service for miquelpuig.studio

**Effective Date: July 4, 2024**

## 1. Introduction
Welcome to miquelpuig.studio, a personal site dedicated to showcasing my professional profile, projects, and providing access to various tools. These terms govern the use of my website and the services offered.

## 2. Acceptance of Terms
By accessing and using miquelpuig.studio, you agree to be bound by these terms of service. If you disagree with any of the terms, please refrain from using the site.

## 3. Modifications and Changes
We reserve the right to modify these terms at any time. Registered users will receive an email notification of any changes. Continued use of the site after such changes will constitute acceptance of the modified terms.

## 4. Account Terms
Registering on our site requires you to handle your password confidentially and securely. Passwords are hashed for your protection. Registration allows you to access non-commercial personal tools at your own risk.

## 5. User Conduct
We expect all users to behave in a respectful and lawful manner while using our site. We prohibit the use of the site for illegal, fraudulent, or abusive activities.

## 6. Intellectual Property Rights
All content published on the site, unless otherwise stated, is owned by miquelpuig.studio. Copying or reproduction of such content without my explicit consent is not permitted.

## 7. Account Termination
I reserve the right to cancel or suspend accounts for any reason, at any time, without liability for the continuity of the service.

## 8. Disclaimer of Warranties
The site and all related services are provided on an "as is" and "as available" basis, without any warranties of any kind.

## 9. Limitation of Liability
We shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our site or services.

## 10. Dispute Resolution
Any dispute related to these terms will attempt to be resolved through informal negotiations. In case a solution is not reached, disputes will be governed by the laws of Spain and resolved in the courts of Barcelona, Spain.

## 11. Cookies
Our site uses cookies to offer a better user experience. By continuing to use our site, you agree to our use of cookies. For more information, please see our [Cookie Policy](/cookies).

## 12. Privacy Policy
Please refer to our Privacy Policy at [miquelpuig.studio/policy](/policy) to understand how we collect and handle your personal information.

## 13. Contact Information
If you have questions about these terms, please contact us through:
- **Email**: [info@miquelpuig.studio](mailto:info@miquelpuig.studio)
- **Contact Form**: [https://miquelpuig.studio/contact](https://miquelpuig.studio/contact)

By using our site, you acknowledge that you have read and understood these Terms of Service and agree to be bound by them.
`;

const cookie = `# Cookie Policy for miquelpuig.studio

**Effective Date: July 19, 2024**

### What are cookies?

Cookies are small text files that are stored on your device when you visit a website. These cookies allow the website to recognize your device and store certain information about your preferences or previous actions.

### Types of cookies we use

1. **Essential cookies:** These cookies are necessary for the proper functioning of the website. Without them, we would not be able to offer some of the services you have requested.

2. **Performance cookies:** These cookies collect information about how visitors use our website, for example, which pages are most visited and if they receive error messages from web pages. These cookies do not collect information that identifies the visitor. All information these cookies collect is aggregated and therefore anonymous. They are only used to improve the functioning of a website.

3. **Functionality cookies:** These cookies allow the website to remember choices you make (such as your username, language, or the region you are in) and provide enhanced, more personalized features.

### How you can control cookies

You can control and/or delete cookies as you wish. For more details, visit aboutcookies.org. You can delete all cookies that are already on your computer and set most browsers to prevent them from being placed. If you do this, however, you may have to manually adjust some preferences every time you visit a site and some services and functionalities may not work.

### Revoke consent

If you wish to revoke your consent for the use of cookies on this website, you can do so at any time using the button below. By clicking it, all non-essential cookies stored on your device will be removed, and your cookie preferences will be reset.

### Changes to the cookie policy

We reserve the right to modify this cookie policy at any time. Any changes to this policy will be posted on this page and, where appropriate, notified to you by email or through the website.

### Contact

If you have any questions about our cookie policy, you can contact us via email at info@miquelpuig.studio.
`;

export const POLICY_DOCS: Record<PolicyDoc, string> = { privacy, terms, cookie };
