export const WEBSITE_PAGES = [
  { id:'home', title:'Home', path:'/', source:'shared page builder', kind:'marketing', editor:'visual', description:'Main website homepage.' },
  { id:'about', title:'About', path:'/about', source:'shared page builder', kind:'content', editor:'visual', description:'Business story, team or company information.' },
  { id:'services', title:'Services', path:'/services', source:'shared page builder', kind:'marketing', editor:'visual', description:'Main services overview page.' },
  { id:'blog', title:'Blog', path:'/blog', source:'shared blog manager', kind:'content', editor:'blog', description:'Blog index and published articles.' },
  { id:'contact', title:'Contact', path:'/contact', source:'shared page builder', kind:'form', editor:'visual', description:'Contact information and service request form.' },
  { id:'privacy', title:'Privacy Policy', path:'/privacy', source:'shared page builder', kind:'legal', editor:'visual', description:'Website privacy policy.' },
  { id:'terms', title:'Terms of Service', path:'/terms', source:'shared page builder', kind:'legal', editor:'visual', description:'Website terms of service.' },
];

export function getWebsitePages() {
  return WEBSITE_PAGES;
}

export function getWebsitePage(id) {
  return WEBSITE_PAGES.find(page => page.id === id) || null;
}

export function livePageUrl(path) {
  const domain = String(import.meta.env.VITE_SITE_DOMAIN || 'example.com').replace(/^https?:\/\//,'').replace(/\/$/,'');
  return `https://${domain}${path === '/' ? '' : path}`;
}

const block = (type, id, props) => ({ type, props: { id, ...props } });
const hero = (id, eyebrow, heading, text, buttonText = '', buttonUrl = '') => block('HeroBlock', id, {
  eyebrow, heading, headingLevel:'h1', accent:'', text,
  primaryButtonText:buttonText, primaryButtonUrl:buttonUrl,
  secondaryButtonText:'', secondaryButtonUrl:'', note:'',
  image:'', imageAlt:'', background:'light',
});
const heading = (id, text) => block('HeadingBlock', id, { text, level:'h2', align:'left' });
const text = (id, value) => block('TextBlock', id, { text:value, align:'left' });

const PAGE_EDITOR_DATA = {
  home: {
    content: [
      hero('home-hero','Welcome','A clear headline for the business.','Explain what the business does, who it helps, and why a customer should choose it.','View Services','/services'),
      block('ProofStripBlock','home-proof',{
        item1Title:'Clear',item1Text:'Explain one strong benefit.',
        item2Title:'Reliable',item2Text:'Explain another proof point.',
        item3Title:'Local',item3Text:'Add a third reason to choose the business.',
        itemHeadingLevel:'h3',
      }),
      block('ImageTextBlock','home-feature',{
        image:'',alt:'',heading:'Feature a key service or business advantage.',headingLevel:'h2',
        text:'Use this section for the strongest service, story, offer, or differentiator.',
        imagePosition:'left',background:'white',
      }),
      block('CtaBlock','home-cta',{
        heading:'Ready to get started?',headingLevel:'h2',
        text:'Give visitors one obvious next step.',buttonText:'Contact Us',buttonUrl:'/contact',background:'dark',
      }),
    ],
    root:{props:{}},
  },
  about: {
    content: [
      hero('about-hero','About','Tell people who you are.','Use this page for the company story, team, experience, values, and what makes the business different.'),
      heading('about-story','Our story'),
      text('about-story-copy','Replace this text with the business story.'),
      block('ImageTextBlock','about-feature',{image:'',alt:'',heading:'What matters to us',headingLevel:'h2',text:'Explain the values or approach behind the work.',imagePosition:'right',background:'light'}),
    ],
    root:{props:{}},
  },
  services: {
    content: [
      hero('services-hero','Services','What we can help you with.','Introduce the core services and make it easy for customers to understand the offer.','Request a Quote','/contact'),
      heading('services-heading','Our services'),
      text('services-copy','Use Image + Text blocks, headings, and calls to action to build out the service list.'),
      block('CtaBlock','services-cta',{heading:'Need a quote?',headingLevel:'h2',text:'Tell us what you need and we will follow up.',buttonText:'Request a Quote',buttonUrl:'/contact',background:'dark'}),
    ],
    root:{props:{}},
  },
  contact: {
    content: [
      hero('contact-hero','Contact','Tell us what you need.','Use the request form below to send the details.'),
      block('ServiceRequestBlock','contact-request',{
        eyebrow:'Request a quote',heading:'How can we help?',text:'Share the service, timeline and details and we will follow up.',
        serviceOptions:'general|General Enquiry,service|Service Request,quote|Quote Request,other|Other',
        submitButtonText:'Send Request',successHeading:'Request received.',successText:'Thanks. We will review your request and follow up.',
      }),
    ],
    root:{props:{}},
  },
  privacy: {
    content: [
      hero('privacy-hero','Legal','Privacy Policy','Replace this template content with the final privacy policy before launch.'),
      heading('privacy-heading','Privacy'),
      text('privacy-copy','Add the business privacy policy here before production launch.'),
    ],
    root:{props:{}},
  },
  terms: {
    content: [
      hero('terms-hero','Legal','Terms of Service','Replace this template content with the final terms before launch.'),
      heading('terms-heading','Terms'),
      text('terms-copy','Add the business terms of service here before production launch.'),
    ],
    root:{props:{}},
  },
};

export function getInitialPageBuilderData(id) {
  return PAGE_EDITOR_DATA[id] || { content: [], root:{props:{}} };
}
