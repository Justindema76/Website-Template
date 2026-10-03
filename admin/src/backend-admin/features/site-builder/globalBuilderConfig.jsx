import { Menu } from 'lucide-react';
import { imageField } from './siteBuilderConfig';

export const headerDefaults = {
  logo: '',
  brandFirst: 'Business',
  brandSecond: 'Name',
  brandFirstColor: '#0B1F33',
  brandSecondColor: '#2F6BFF',
  nav1Label: 'Home', nav1Url: '/',
  nav2Label: 'About', nav2Url: '/about',
  nav3Label: 'Services', nav3Url: '/services',
  nav4Label: 'Blog', nav4Url: '/blog',
  nav5Label: 'Contact', nav5Url: '/contact',
  nav6Label: '', nav6Url: '',
  nav7Label: '', nav7Url: '',
  buttonText: '', buttonUrl: '',
  socialIconColor: '#415162',
  socialIconBackground: '#ffffff',
  socialIconBorder: '#DCE4EC',
  socialIconHoverColor: '#ffffff',
  socialIconHoverBackground: '#2F6BFF',
  background: 'white',
};

export const footerDefaults = {
  logo: '',
  brand: 'Business Name',
  tagline: 'Add your business tagline.',
  column1Title: 'Explore',
  link1Label: 'Home', link1Url: '/',
  link2Label: 'About', link2Url: '/about',
  link3Label: 'Services', link3Url: '/services',
  link4Label: 'Blog', link4Url: '/blog',
  column2Title: 'Connect',
  link5Label: 'Contact', link5Url: '/contact',
  link6Label: '', link6Url: '',
  link7Label: '', link7Url: '',
  link8Label: '', link8Url: '',
  socialTitle: 'Connect',
  socialText: 'Follow us for updates.',
  copyright: 'Business Name. All rights reserved.',
  privacyLabel: 'Privacy', privacyUrl: '/privacy',
  termsLabel: 'Terms', termsUrl: '/terms',
  socialIconColor: '#ffffff',
  socialIconBackground: 'rgba(255,255,255,.04)',
  socialIconBorder: 'rgba(255,255,255,.18)',
  socialIconHoverColor: '#ffffff',
  socialIconHoverBackground: '#2F6BFF',
  background: 'dark',
};

export const projectRequestDefaults = {
  id: 'project-request',
  tabLabel: 'Request a Quote',
  mobileLabel: 'Request a Quote',
  eyebrow: 'Project request',
  title: 'Tell us what you need.',
  description: 'Share the service you need, your timeline, and any important details.',
  websiteLabel: 'Website',
  serviceLabel: 'Service needed',
  budgetLabel: 'Budget range',
  timelineLabel: 'Timeline',
  messageLabel: 'Project details',
  messagePlaceholder: 'Tell us what you need help with.',
  consentLabel: 'You can contact me about this request.',
  submitLabel: 'Send Request',
  submittingLabel: 'Sending request…',
  successTitle: 'Request received.',
  successMessage: 'Thanks. Your request has been received.',
  nextStepTitle: 'What happens next?',
  nextStepText: 'Your request will be reviewed and followed up using the contact information you provide.',
  privacyText: 'By submitting, you are asking this business to contact you about your request.',
  errorMessage: 'Unable to submit your request right now.',
  closeLabel: 'Close',
  primary: '#2F6BFF',
  primaryHover: '#2458D8',
  primaryDark: '#1748BE',
};

const backgrounds = [
  { label: 'White', value: 'white' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

const cssColorField = label => ({ type: 'text', label });

function previewClick(event) {
  event.preventDefault();
}

function socialItems(socialLinks = {}) {
  return ['linkedin','github','instagram','facebook','youtube','tiktok']
    .filter(key => socialLinks?.[key]?.url && socialLinks?.[key]?.enabled !== false)
    .map(key => ({ key, label: key.charAt(0).toUpperCase() + key.slice(1), url: socialLinks[key].url }));
}

export function globalConfigFor(type, siteKey = 'template', socialLinks = {}) {
  const socials = socialItems(socialLinks);

  if (type === 'project-request') {
    return {
      categories: { global: { title: 'Global Request Drawer', components: ['ProjectRequestBlock'] } },
      components: {
        ProjectRequestBlock: {
          label: 'Request Drawer',
          fields: {
            tabLabel: { type: 'text', label: 'Desktop tab label' },
            mobileLabel: { type: 'text', label: 'Mobile button label' },
            eyebrow: { type: 'text', label: 'Eyebrow' },
            title: { type: 'text', label: 'Drawer heading' },
            description: { type: 'textarea', label: 'Drawer description' },
            websiteLabel: { type: 'text', label: 'Website field label' },
            serviceLabel: { type: 'text', label: 'Service field label' },
            budgetLabel: { type: 'text', label: 'Budget field label' },
            timelineLabel: { type: 'text', label: 'Timeline field label' },
            messageLabel: { type: 'text', label: 'Project details field label' },
            messagePlaceholder: { type: 'textarea', label: 'Project details placeholder' },
            consentLabel: { type: 'text', label: 'Consent checkbox text' },
            nextStepTitle: { type: 'text', label: 'Next step heading' },
            nextStepText: { type: 'textarea', label: 'Next step text' },
            submitLabel: { type: 'text', label: 'Submit button text' },
            submittingLabel: { type: 'text', label: 'Submitting button text' },
            successTitle: { type: 'text', label: 'Success heading' },
            successMessage: { type: 'textarea', label: 'Success text' },
            privacyText: { type: 'textarea', label: 'Privacy / consent footer' },
            errorMessage: { type: 'text', label: 'Error message' },
            closeLabel: { type: 'text', label: 'Close button text' },
            primary: cssColorField('Primary colour'),
            primaryHover: cssColorField('Primary hover colour'),
            primaryDark: cssColorField('Primary dark colour'),
          },
          defaultProps: projectRequestDefaults,
          render: raw => {
            const p = { ...projectRequestDefaults, ...raw };
            return <div style={{maxWidth:760,margin:'0 auto',border:'1px solid #dce4ec',borderRadius:18,overflow:'hidden',background:'#fff'}}>
              <div style={{padding:'24px 26px',borderBottom:'1px solid #e4e9ee'}}>
                <span style={{fontSize:11,fontWeight:800,textTransform:'uppercase',color:p.primary}}>{p.eyebrow}</span>
                <h2>{p.title}</h2>
                <p>{p.description}</p>
              </div>
              <div style={{padding:24,display:'grid',gap:10}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  <div style={{height:46,border:'1px solid #d7dce1',borderRadius:9}}/>
                  <div style={{height:46,border:'1px solid #d7dce1',borderRadius:9}}/>
                </div>
                <div style={{height:100,border:'1px solid #d7dce1',borderRadius:9}}/>
                <button type="button" style={{height:46,border:0,borderRadius:9,background:p.primary,color:'#fff',fontWeight:800}}>{p.submitLabel}</button>
              </div>
            </div>;
          },
        },
      },
    };
  }

  if (type === 'header') {
    return {
      categories: { global: { title: 'Global Header', components: ['HeaderBlock'] } },
      components: {
        HeaderBlock: {
          label: 'Website Header',
          fields: {
            logo: { ...imageField, label: 'Logo' },
            brandFirst: { type: 'text', label: 'Brand first part' },
            brandFirstColor: cssColorField('Brand first colour'),
            brandSecond: { type: 'text', label: 'Brand second part' },
            brandSecondColor: cssColorField('Brand second colour'),
            nav1Label: { type: 'text', label: 'Link 1 label' }, nav1Url: { type: 'text', label: 'Link 1 URL' },
            nav2Label: { type: 'text', label: 'Link 2 label' }, nav2Url: { type: 'text', label: 'Link 2 URL' },
            nav3Label: { type: 'text', label: 'Link 3 label' }, nav3Url: { type: 'text', label: 'Link 3 URL' },
            nav4Label: { type: 'text', label: 'Link 4 label' }, nav4Url: { type: 'text', label: 'Link 4 URL' },
            nav5Label: { type: 'text', label: 'Link 5 label' }, nav5Url: { type: 'text', label: 'Link 5 URL' },
            nav6Label: { type: 'text', label: 'Link 6 label' }, nav6Url: { type: 'text', label: 'Link 6 URL' },
            nav7Label: { type: 'text', label: 'Link 7 label' }, nav7Url: { type: 'text', label: 'Link 7 URL' },
            buttonText: { type: 'text', label: 'Button text' },
            buttonUrl: { type: 'text', label: 'Button URL' },
            socialIconColor: cssColorField('Social icon colour'),
            socialIconBackground: cssColorField('Social icon background'),
            socialIconBorder: cssColorField('Social icon border'),
            socialIconHoverColor: cssColorField('Social icon hover colour'),
            socialIconHoverBackground: cssColorField('Social icon hover background'),
            background: { type: 'select', label: 'Background', options: backgrounds },
          },
          defaultProps: headerDefaults,
          render: raw => {
            const p = { ...headerDefaults, ...raw };
            const links = Array.from({length:7},(_,i)=>[p[`nav${i+1}Label`],p[`nav${i+1}Url`]]).filter(([label])=>label);
            return <div className={`global-header-preview global-theme-${p.background || 'white'}`}>
              <a className="global-preview-brand" href="/" onClick={previewClick}>
                {p.logo ? <img src={p.logo} alt=""/> : null}
                <strong><span style={{color:p.brandFirstColor}}>{p.brandFirst}</span>{' '}<span style={{color:p.brandSecondColor}}>{p.brandSecond}</span></strong>
              </a>
              <nav>{links.map(([label,url],i)=><a key={i} href={url || '#'} onClick={previewClick}>{label}</a>)}</nav>
              {socials.length > 0 && <div className="global-social-preview">{socials.map(item=><a key={item.key} href={item.url} onClick={previewClick}>{item.label[0]}</a>)}</div>}
              {p.buttonText && <a className="global-preview-button" href={p.buttonUrl || '#'} onClick={previewClick}>{p.buttonText}</a>}
              <span className="global-mobile-menu"><Menu size={24}/></span>
            </div>;
          },
        },
      },
    };
  }

  return {
    categories: { global: { title: 'Global Footer', components: ['FooterBlock'] } },
    components: {
      FooterBlock: {
        label: 'Website Footer',
        fields: {
          logo: { ...imageField, label: 'Logo' },
          brand: { type: 'text', label: 'Brand name' },
          tagline: { type: 'text', label: 'Tagline' },
          column1Title: { type: 'text', label: 'Column 1 title' },
          link1Label: { type: 'text', label: 'Link 1 label' }, link1Url: { type: 'text', label: 'Link 1 URL' },
          link2Label: { type: 'text', label: 'Link 2 label' }, link2Url: { type: 'text', label: 'Link 2 URL' },
          link3Label: { type: 'text', label: 'Link 3 label' }, link3Url: { type: 'text', label: 'Link 3 URL' },
          link4Label: { type: 'text', label: 'Link 4 label' }, link4Url: { type: 'text', label: 'Link 4 URL' },
          column2Title: { type: 'text', label: 'Column 2 title' },
          link5Label: { type: 'text', label: 'Link 5 label' }, link5Url: { type: 'text', label: 'Link 5 URL' },
          link6Label: { type: 'text', label: 'Link 6 label' }, link6Url: { type: 'text', label: 'Link 6 URL' },
          link7Label: { type: 'text', label: 'Link 7 label' }, link7Url: { type: 'text', label: 'Link 7 URL' },
          link8Label: { type: 'text', label: 'Link 8 label' }, link8Url: { type: 'text', label: 'Link 8 URL' },
          socialTitle: { type: 'text', label: 'Social heading' },
          socialText: { type: 'text', label: 'Social text' },
          copyright: { type: 'text', label: 'Copyright text' },
          privacyLabel: { type: 'text', label: 'Privacy label' }, privacyUrl: { type: 'text', label: 'Privacy URL' },
          termsLabel: { type: 'text', label: 'Terms label' }, termsUrl: { type: 'text', label: 'Terms URL' },
          socialIconColor: cssColorField('Social icon colour'),
          socialIconBackground: cssColorField('Social icon background'),
          socialIconBorder: cssColorField('Social icon border'),
          socialIconHoverColor: cssColorField('Social icon hover colour'),
          socialIconHoverBackground: cssColorField('Social icon hover background'),
          background: { type: 'select', label: 'Background', options: backgrounds },
        },
        defaultProps: footerDefaults,
        render: raw => {
          const p = { ...footerDefaults, ...raw };
          const col1 = [1,2,3,4].map(i=>[p[`link${i}Label`],p[`link${i}Url`]]).filter(([label])=>label);
          const col2 = [5,6,7,8].map(i=>[p[`link${i}Label`],p[`link${i}Url`]]).filter(([label])=>label);
          return <footer className={`global-footer-preview global-theme-${p.background || 'dark'}`}>
            <div className="global-footer-grid">
              <div><strong>{p.brand}</strong><p>{p.tagline}</p></div>
              <div className="global-footer-links"><strong>{p.column1Title}</strong>{col1.map(([l,u],i)=><a href={u || '#'} onClick={previewClick} key={i}>{l}</a>)}</div>
              <div className="global-footer-links"><strong>{p.column2Title}</strong>{col2.map(([l,u],i)=><a href={u || '#'} onClick={previewClick} key={i}>{l}</a>)}</div>
              <div><strong>{p.socialTitle}</strong><p>{p.socialText}</p></div>
            </div>
          </footer>;
        },
      },
    },
  };
}

export function defaultGlobalData(type) {
  const defaults = type === 'header' ? headerDefaults : type === 'footer' ? footerDefaults : projectRequestDefaults;
  const component = type === 'header' ? 'HeaderBlock' : type === 'footer' ? 'FooterBlock' : 'ProjectRequestBlock';
  return {
    content: [{ type: component, props: { id: `global-${type}`, ...defaults } }],
    root: { props: {} },
  };
}
