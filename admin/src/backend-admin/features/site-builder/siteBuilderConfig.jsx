import { useEffect, useState } from 'react';
import { FieldLabel } from '@puckeditor/core';
import { Image as ImageIcon, Library, Upload } from 'lucide-react';
import { useAuth } from '../../auth/AdminAuthContext';
import MediaPickerModal from '../social-automation/components/MediaPickerModal';
import { loadAdminMedia, uploadSiteImage } from '../../services/siteAdminService';

function ImageLibraryField({ field, value, onChange }) {
  const { accessToken } = useAuth();
  const [media, setMedia] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const refresh = async () => {
    if (!accessToken) return;
    setLoading(true);
    setError('');
    try {
      const items = await loadAdminMedia(accessToken);
      setMedia(items.filter(item => (item.mediaType || 'image') === 'image'));
    } catch (err) {
      setError(err.message || 'Unable to load media.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pickerOpen && !media.length) refresh();
  }, [pickerOpen, accessToken]);

  const upload = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const url = await uploadSiteImage(accessToken, file);
      onChange(url);
      await refresh();
    } catch (err) {
      setError(err.message || 'Unable to upload image.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return <>
    <FieldLabel label={field.label || 'Image'}>
      <div className="jci-puck-image-field">
        {value
          ? <img src={value} alt="" className="jci-puck-image-thumb"/>
          : <div className="jci-puck-image-empty"><ImageIcon size={22}/><span>No image selected</span></div>}
        <input
          className="jci-puck-url-input"
          value={value || ''}
          onChange={event => onChange(event.target.value)}
          placeholder="https://example.com/path/image.png"
          aria-label="External image URL"
        />
        <small className="jci-puck-image-help">Choose from Media, upload a new image, or paste a public image URL.</small>
        <div className="jci-puck-image-actions">
          <button type="button" onClick={() => setPickerOpen(true)} disabled={loading}>
            <Library size={14}/> {loading ? 'Loading…' : 'Choose Media'}
          </button>
          <label>
            <Upload size={14}/> {uploading ? 'Uploading…' : 'Upload New'}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={upload} disabled={uploading}/>
          </label>
        </div>
        {error && <small className="jci-puck-field-error">{error}</small>}
      </div>
    </FieldLabel>
    {pickerOpen && <MediaPickerModal
      items={media}
      onClose={() => setPickerOpen(false)}
      onSelect={item => {
        onChange(item.url);
        setPickerOpen(false);
      }}
    />}
  </>;
}

export const imageField = {
  type: 'custom',
  label: 'Image',
  render: props => <ImageLibraryField {...props}/>,
};

const backgroundOptions = [
  { label: 'White', value: 'white' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

const headingOptions = [
  { label: 'H1', value: 'h1' },
  { label: 'H2', value: 'h2' },
  { label: 'H3', value: 'h3' },
  { label: 'H4', value: 'h4' },
];

function Heading({ level = 'h2', children }) {
  const Tag = ['h1','h2','h3','h4'].includes(level) ? level : 'h2';
  return <Tag>{children}</Tag>;
}

function prevent(event) {
  event.preventDefault();
}

export const siteBuilderConfig = {
  categories: {
    essentials: {
      title: 'Essentials',
      components: ['HeroBlock', 'HeadingBlock', 'TextBlock', 'ImageBlock', 'ImageTextBlock'],
    },
    marketing: {
      title: 'Marketing',
      components: ['CtaBlock', 'ServiceRequestBlock'],
    },
    showcase: {
      title: 'Showcase',
      components: ['ShowcaseHeroBlock', 'ProofStripBlock'],
    },
  },
  components: {
    HeroBlock: {
      label: 'Hero',
      fields: {
        eyebrow: { type: 'text', label: 'Eyebrow' },
        heading: { type: 'text', label: 'Heading' },
        headingLevel: { type: 'select', label: 'Heading level', options: headingOptions },
        accent: { type: 'text', label: 'Accent text' },
        text: { type: 'textarea', label: 'Description' },
        primaryButtonText: { type: 'text', label: 'Primary button text' },
        primaryButtonUrl: { type: 'text', label: 'Primary button URL' },
        secondaryButtonText: { type: 'text', label: 'Secondary button text' },
        secondaryButtonUrl: { type: 'text', label: 'Secondary button URL' },
        note: { type: 'text', label: 'Small note' },
        image: imageField,
        imageAlt: { type: 'text', label: 'Image alt text' },
        background: { type: 'select', label: 'Background', options: backgroundOptions },
      },
      defaultProps: {
        eyebrow: 'Welcome',
        heading: 'A clear headline for the business.',
        headingLevel: 'h1',
        accent: '',
        text: 'Explain what the business does and why a customer should care.',
        primaryButtonText: 'Get Started',
        primaryButtonUrl: '/contact',
        secondaryButtonText: '',
        secondaryButtonUrl: '',
        note: '',
        image: '',
        imageAlt: '',
        background: 'light',
      },
      render: p => <section className={`jci-builder-section jci-builder-hero theme-${p.background || 'light'} ${p.image ? 'with-media' : 'without-media'}`}>
        <div className="jci-builder-hero-copy">
          {p.eyebrow && <p className="jci-builder-eyebrow">{p.eyebrow}</p>}
          <Heading level={p.headingLevel || 'h1'}>{p.heading}{p.accent ? <> <span>{p.accent}</span></> : null}</Heading>
          {p.text && <p>{p.text}</p>}
          <div className="shared-showcase-actions jci-builder-hero-actions">
            {p.primaryButtonText && <a className="shared-btn shared-btn-primary" href={p.primaryButtonUrl || '#'} onClick={prevent}>{p.primaryButtonText}</a>}
            {p.secondaryButtonText && <a className="shared-btn shared-btn-secondary" href={p.secondaryButtonUrl || '#'} onClick={prevent}>{p.secondaryButtonText}</a>}
          </div>
        </div>
        {p.image && <div className="jci-builder-hero-media"><img src={p.image} alt={p.imageAlt || ''}/></div>}
      </section>,
    },

    HeadingBlock: {
      label: 'Heading',
      fields: {
        text: { type: 'text', label: 'Heading' },
        level: { type: 'select', label: 'Heading level', options: headingOptions },
        align: { type: 'radio', label: 'Alignment', options: [
          { label: 'Left', value: 'left' },
          { label: 'Centre', value: 'center' },
          { label: 'Right', value: 'right' },
        ]},
      },
      defaultProps: { text: 'Section heading', level: 'h2', align: 'left' },
      render: p => <div className="jci-builder-heading-wrap" style={{ textAlign: p.align || 'left' }}><Heading level={p.level}>{p.text}</Heading></div>,
    },

    TextBlock: {
      label: 'Text',
      fields: {
        text: { type: 'textarea', label: 'Text' },
        align: { type: 'radio', label: 'Alignment', options: [
          { label: 'Left', value: 'left' },
          { label: 'Centre', value: 'center' },
        ]},
      },
      defaultProps: { text: 'Add your content here.', align: 'left' },
      render: p => <div className="jci-builder-text" style={{ textAlign: p.align || 'left' }}><p>{p.text}</p></div>,
    },

    ImageBlock: {
      label: 'Image',
      fields: {
        image: imageField,
        alt: { type: 'text', label: 'Alt text' },
        width: { type: 'select', label: 'Width', options: [
          { label: '50%', value: '50' },
          { label: '75%', value: '75' },
          { label: '100%', value: '100' },
        ]},
      },
      defaultProps: { image: '', alt: '', width: '100' },
      render: p => <div className="jci-builder-image-wrap">
        {p.image ? <img src={p.image} alt={p.alt || ''} style={{ width: `${p.width || 100}%` }}/> : <div className="jci-builder-placeholder"><ImageIcon size={34}/><span>Choose an image</span></div>}
      </div>,
    },

    ImageTextBlock: {
      label: 'Image + Text',
      fields: {
        image: imageField,
        alt: { type: 'text', label: 'Image alt text' },
        heading: { type: 'text', label: 'Heading' },
        headingLevel: { type: 'select', label: 'Heading level', options: headingOptions },
        text: { type: 'textarea', label: 'Text' },
        imagePosition: { type: 'radio', label: 'Image position', options: [
          { label: 'Left', value: 'left' },
          { label: 'Right', value: 'right' },
        ]},
        background: { type: 'select', label: 'Background', options: backgroundOptions },
      },
      defaultProps: {
        image: '', alt: '', heading: 'Feature heading', headingLevel: 'h2',
        text: 'Use this section for a service, story, product, or business feature.',
        imagePosition: 'left', background: 'white',
      },
      render: p => <section className={`jci-builder-section jci-builder-image-text theme-${p.background || 'white'} image-${p.imagePosition || 'left'}`}>
        <div className="jci-builder-image-text-media">
          {p.image ? <img src={p.image} alt={p.alt || ''}/> : <div className="jci-builder-placeholder"><ImageIcon size={34}/><span>Choose an image</span></div>}
        </div>
        <div><Heading level={p.headingLevel}>{p.heading}</Heading><p>{p.text}</p></div>
      </section>,
    },

    CtaBlock: {
      label: 'Call to Action',
      fields: {
        heading: { type: 'text', label: 'Heading' },
        headingLevel: { type: 'select', label: 'Heading level', options: headingOptions },
        text: { type: 'textarea', label: 'Text' },
        buttonText: { type: 'text', label: 'Button text' },
        buttonUrl: { type: 'text', label: 'Button URL' },
        background: { type: 'select', label: 'Background', options: backgroundOptions },
      },
      defaultProps: {
        heading: 'Ready to get started?',
        headingLevel: 'h2',
        text: 'Give the customer a clear next step.',
        buttonText: 'Contact Us',
        buttonUrl: '/contact',
        background: 'dark',
      },
      render: p => <section className={`jci-builder-section theme-${p.background || 'dark'}`} style={{textAlign:'center'}}>
        <Heading level={p.headingLevel}>{p.heading}</Heading>
        <p>{p.text}</p>
        {p.buttonText && <a className="shared-btn shared-btn-primary" href={p.buttonUrl || '#'} onClick={prevent}>{p.buttonText}</a>}
      </section>,
    },

    ServiceRequestBlock: {
      label: 'Service / Quote Request Form',
      fields: {
        eyebrow: { type: 'text', label: 'Eyebrow' },
        heading: { type: 'text', label: 'Heading' },
        text: { type: 'textarea', label: 'Description' },
        serviceOptions: { type: 'textarea', label: 'Services (value|Label, comma separated)' },
        submitButtonText: { type: 'text', label: 'Submit button text' },
        successHeading: { type: 'text', label: 'Success heading' },
        successText: { type: 'textarea', label: 'Success text' },
      },
      defaultProps: {
        eyebrow: 'Request a quote',
        heading: 'Tell us what you need.',
        text: 'Share the service, timeline and details and we will follow up.',
        serviceOptions: 'general|General Enquiry,website|Website,consultation|Consultation,other|Other',
        submitButtonText: 'Send Request',
        successHeading: 'Request received.',
        successText: 'Thanks. We will review your request and follow up.',
      },
      render: p => <section className="service-request-section">
        <div className="shared-wrap">
          <div className="shared-eyebrow">{p.eyebrow}</div>
          <Heading level="h2">{p.heading}</Heading>
          <p>{p.text}</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:18}}>
            {['Name','Email','Phone','Service'].map(label => <div key={label} style={{height:44,border:'1px solid #dce4ec',borderRadius:9,padding:'11px 12px',color:'#7b8794'}}>{label}</div>)}
          </div>
          <div style={{height:100,border:'1px solid #dce4ec',borderRadius:9,padding:12,marginTop:10,color:'#7b8794'}}>Project details</div>
          <button type="button" style={{marginTop:12}}>{p.submitButtonText}</button>
        </div>
      </section>,
    },

    ShowcaseHeroBlock: {
      label: 'Showcase Hero',
      fields: {
        eyebrow: { type: 'text', label: 'Eyebrow' },
        heading: { type: 'text', label: 'Heading' },
        headingLevel: { type: 'select', label: 'Heading level', options: headingOptions },
        accent: { type: 'text', label: 'Accent text' },
        text: { type: 'textarea', label: 'Description' },
        primaryButtonText: { type: 'text', label: 'Primary button text' },
        primaryButtonUrl: { type: 'text', label: 'Primary button URL' },
        secondaryButtonText: { type: 'text', label: 'Secondary button text' },
        secondaryButtonUrl: { type: 'text', label: 'Secondary button URL' },
        note: { type: 'text', label: 'Note' },
        image: imageField,
        imageAlt: { type: 'text', label: 'Image alt text' },
      },
      defaultProps: {
        eyebrow: 'Featured',
        heading: 'Showcase a service, project or offer.',
        headingLevel: 'h1',
        accent: '',
        text: 'Use a strong visual and concise copy.',
        primaryButtonText: 'Learn More',
        primaryButtonUrl: '/services',
        secondaryButtonText: '',
        secondaryButtonUrl: '',
        note: '',
        image: '',
        imageAlt: '',
      },
      render: p => <section className="shared-showcase-hero">
        <div className="shared-showcase-grid">
          <div className="shared-showcase-copy">
            <div className="shared-eyebrow">{p.eyebrow}</div>
            <Heading level={p.headingLevel}>{p.heading} {p.accent && <span>{p.accent}</span>}</Heading>
            <p>{p.text}</p>
          </div>
          <div className="shared-showcase-image">
            {p.image ? <img src={p.image} alt={p.imageAlt || ''}/> : <div className="jci-builder-placeholder"><ImageIcon size={34}/><span>Choose an image</span></div>}
          </div>
        </div>
      </section>,
    },

    ProofStripBlock: {
      label: '3-Item Proof Strip',
      fields: {
        item1Title: { type: 'text', label: 'Item 1 title' },
        item1Text: { type: 'text', label: 'Item 1 text' },
        item2Title: { type: 'text', label: 'Item 2 title' },
        item2Text: { type: 'text', label: 'Item 2 text' },
        item3Title: { type: 'text', label: 'Item 3 title' },
        item3Text: { type: 'text', label: 'Item 3 text' },
        itemHeadingLevel: { type: 'select', label: 'Item heading level', options: headingOptions },
      },
      defaultProps: {
        item1Title: 'Clear', item1Text: 'Explain one benefit.',
        item2Title: 'Fast', item2Text: 'Explain another benefit.',
        item3Title: 'Reliable', item3Text: 'Add a third proof point.',
        itemHeadingLevel: 'h3',
      },
      render: p => <section className="shared-proof-strip"><div className="shared-proof-grid">
        {[1,2,3].map(n => <div className="shared-proof" key={n}><Heading level={p.itemHeadingLevel}>{p[`item${n}Title`]}</Heading><span>{p[`item${n}Text`]}</span></div>)}
      </div></section>,
    },
  },
};

export default siteBuilderConfig;
