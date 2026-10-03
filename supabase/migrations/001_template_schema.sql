create extension if not exists pgcrypto;

create table if not exists public.site_admins (
  email text primary key,
  created_at timestamptz not null default now()
);

create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.site_admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_site_admin() from public;
grant execute on function public.is_site_admin() to authenticated;

create table if not exists public.site_settings (
  site_key text not null,
  setting_key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (site_key, setting_key)
);

create table if not exists public.site_pages (
  site_key text not null,
  page_id text not null,
  path text not null,
  title text not null,
  content jsonb not null default '{"content":[],"root":{"props":{}}}'::jsonb,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (site_key, page_id)
);

create table if not exists public.site_page_drafts (
  site_key text not null,
  page_id text not null,
  path text not null,
  title text not null,
  content jsonb not null default '{"content":[],"root":{"props":{}}}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (site_key, page_id)
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  site_key text not null default 'template',
  title text not null,
  slug text not null,
  excerpt text not null default '',
  seo_title text not null default '',
  seo_description text not null default '',
  category text not null default 'General',
  tags text[] not null default '{}',
  featured_image text not null default '',
  body text not null default '',
  status text not null default 'draft' check (status in ('draft','published')),
  author_name text not null default 'Business Name',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_key, slug)
);

create table if not exists public.site_videos (
  id uuid primary key default gen_random_uuid(),
  site_key text not null default 'template',
  title text not null,
  youtube_url text not null default '',
  youtube_id text not null default '',
  description text not null default '',
  placement text not null default 'homepage',
  sort_order integer not null default 0,
  status text not null default 'active' check (status in ('active','hidden')),
  content_type text not null default 'video' check (content_type in ('video','short')),
  playlist_name text not null default 'Website',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  site_key text not null default 'template',
  name text not null,
  email text not null,
  phone text not null default '',
  company text not null default '',
  website text not null default '',
  requested_service text not null default 'not_sure',
  budget_range text not null default '',
  timeline text not null default '',
  message text not null default '',
  contact_consent boolean not null default false,
  status text not null default 'new',
  source_path text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  internal_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hiring_contacts (
  id uuid primary key default gen_random_uuid(),
  site_key text not null default 'template',
  name text not null,
  company text not null default '',
  email text not null,
  phone text not null default '',
  website_or_linkedin text not null default '',
  reason text not null default '',
  role_title text not null default '',
  message text not null default '',
  employment_consent boolean not null default false,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_site_status_published_idx
  on public.blog_posts (site_key, status, published_at desc);

create index if not exists site_videos_site_status_sort_idx
  on public.site_videos (site_key, status, sort_order);

create index if not exists service_requests_site_created_idx
  on public.service_requests (site_key, created_at desc);

alter table public.site_admins enable row level security;
alter table public.site_settings enable row level security;
alter table public.site_pages enable row level security;
alter table public.site_page_drafts enable row level security;
alter table public.blog_posts enable row level security;
alter table public.site_videos enable row level security;
alter table public.service_requests enable row level security;
alter table public.hiring_contacts enable row level security;

drop policy if exists "public read website settings" on public.site_settings;
create policy "public read website settings"
on public.site_settings for select
to anon, authenticated
using (
  setting_key in (
    'global_header',
    'global_footer',
    'global_project-request',
    'global_styles',
    'social_links',
    'site_profile'
  )
);

drop policy if exists "public read published pages" on public.site_pages;
create policy "public read published pages"
on public.site_pages for select
to anon, authenticated
using (published_at is not null);

drop policy if exists "public read published blog posts" on public.blog_posts;
create policy "public read published blog posts"
on public.blog_posts for select
to anon, authenticated
using (status = 'published');

drop policy if exists "public read active videos" on public.site_videos;
create policy "public read active videos"
on public.site_videos for select
to anon, authenticated
using (status = 'active');

drop policy if exists "admin read drafts" on public.site_page_drafts;
create policy "admin read drafts"
on public.site_page_drafts for select
to authenticated
using (public.is_site_admin());

drop policy if exists "admin manage drafts" on public.site_page_drafts;
create policy "admin manage drafts"
on public.site_page_drafts for all
to authenticated
using (public.is_site_admin())
with check (public.is_site_admin());

insert into public.site_settings (site_key, setting_key, value)
values
(
  'template',
  'global_header',
  jsonb_build_object(
    'content', jsonb_build_array(
      jsonb_build_object(
        'type','HeaderBlock',
        'props', jsonb_build_object(
          'id','global-header',
          'logo','',
          'brandFirst','Business',
          'brandSecond','Name',
          'brandFirstColor','#0B1F33',
          'brandSecondColor','#2F6BFF',
          'nav1Label','Home','nav1Url','/',
          'nav2Label','About','nav2Url','/about',
          'nav3Label','Services','nav3Url','/services',
          'nav4Label','Blog','nav4Url','/blog',
          'nav5Label','Contact','nav5Url','/contact',
          'nav6Label','','nav6Url','',
          'nav7Label','','nav7Url','',
          'buttonText','','buttonUrl','',
          'socialIconColor','#415162',
          'socialIconBackground','#ffffff',
          'socialIconBorder','#DCE4EC',
          'socialIconHoverColor','#ffffff',
          'socialIconHoverBackground','#2F6BFF',
          'background','white'
        )
      )
    ),
    'root', jsonb_build_object('props',jsonb_build_object())
  )
),
(
  'template',
  'global_footer',
  jsonb_build_object(
    'content', jsonb_build_array(
      jsonb_build_object(
        'type','FooterBlock',
        'props', jsonb_build_object(
          'id','global-footer',
          'logo','',
          'brand','Business Name',
          'tagline','Add your business tagline.',
          'column1Title','Explore',
          'link1Label','Home','link1Url','/',
          'link2Label','About','link2Url','/about',
          'link3Label','Services','link3Url','/services',
          'link4Label','Blog','link4Url','/blog',
          'column2Title','Connect',
          'link5Label','Contact','link5Url','/contact',
          'link6Label','','link6Url','',
          'link7Label','','link7Url','',
          'link8Label','','link8Url','',
          'socialTitle','Connect',
          'socialText','Follow us for updates.',
          'copyright','Business Name. All rights reserved.',
          'privacyLabel','Privacy','privacyUrl','/privacy',
          'termsLabel','Terms','termsUrl','/terms',
          'background','dark'
        )
      )
    ),
    'root', jsonb_build_object('props',jsonb_build_object())
  )
),
(
  'template',
  'global_project-request',
  jsonb_build_object(
    'content', jsonb_build_array(
      jsonb_build_object(
        'type','ProjectRequestBlock',
        'props', jsonb_build_object(
          'id','global-project-request',
          'tabLabel','Request a Quote',
          'mobileLabel','Request a Quote',
          'eyebrow','Project request',
          'title','Tell us what you need.',
          'description','Share the service you need, your timeline, and any important details.',
          'websiteLabel','Website',
          'serviceLabel','Service needed',
          'budgetLabel','Budget range',
          'timelineLabel','Timeline',
          'messageLabel','Project details',
          'messagePlaceholder','Tell us what you need help with.',
          'consentLabel','You can contact me about this request.',
          'submitLabel','Send Request',
          'submittingLabel','Sending request…',
          'successTitle','Request received.',
          'successMessage','Thanks. Your request has been received.',
          'nextStepTitle','What happens next?',
          'nextStepText','Your request will be reviewed and followed up using the contact information you provide.',
          'privacyText','By submitting, you are asking this business to contact you about your request.',
          'errorMessage','Unable to submit your request right now.',
          'closeLabel','Close',
          'primary','#2F6BFF',
          'primaryHover','#2458D8',
          'primaryDark','#1748BE'
        )
      )
    ),
    'root', jsonb_build_object('props',jsonb_build_object())
  )
),
(
  'template',
  'global_styles',
  '{
    "primary":"#1f67b2",
    "primaryDark":"#185892",
    "text":"#202223",
    "muted":"#5c6268",
    "pageBackground":"#f7f8fa",
    "surface":"#ffffff",
    "lightSurface":"#eef5fc",
    "border":"#dfe3e8",
    "darkSurface":"#111b27",
    "headingFont":"Inter, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    "bodyFont":"Inter, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif",
    "h1Size":64,
    "h2Size":48,
    "h3Size":36,
    "h4Size":24,
    "contentWidth":1180,
    "sectionSpacing":76,
    "cardRadius":14,
    "buttonRadius":8,
    "buttonHeight":40
  }'::jsonb
),
(
  'template',
  'social_links',
  '{
    "facebook":{"url":"","enabled":true},
    "instagram":{"url":"","enabled":true},
    "linkedin":{"url":"","enabled":true},
    "github":{"url":"","enabled":true},
    "youtube":{"url":"","enabled":true},
    "tiktok":{"url":"","enabled":true}
  }'::jsonb
),
(
  'template',
  'site_profile',
  '{
    "businessName":"Business Name",
    "domain":"example.com",
    "contactEmail":"",
    "contactPhone":"",
    "address":"",
    "defaultSeoTitle":"Business Name",
    "defaultSeoDescription":"Add your website description."
  }'::jsonb
)
on conflict (site_key, setting_key) do nothing;

with page_seed(page_id,path,title,content) as (
  values
  (
    'home','/','Home',
    '{
      "content":[
        {"type":"HeroBlock","props":{"id":"home-hero","eyebrow":"Welcome","heading":"A clear headline for the business.","headingLevel":"h1","accent":"","text":"Explain what the business does, who it helps, and why a customer should choose it.","primaryButtonText":"View Services","primaryButtonUrl":"/services","secondaryButtonText":"","secondaryButtonUrl":"","note":"","image":"","imageAlt":"","background":"light"}},
        {"type":"ProofStripBlock","props":{"id":"home-proof","item1Title":"Clear","item1Text":"Explain one strong benefit.","item2Title":"Reliable","item2Text":"Explain another proof point.","item3Title":"Local","item3Text":"Add a third reason to choose the business.","itemHeadingLevel":"h3"}},
        {"type":"ImageTextBlock","props":{"id":"home-feature","image":"","alt":"","heading":"Feature a key service or business advantage.","headingLevel":"h2","text":"Use this section for the strongest service, story, offer, or differentiator.","imagePosition":"left","background":"white"}},
        {"type":"CtaBlock","props":{"id":"home-cta","heading":"Ready to get started?","headingLevel":"h2","text":"Give visitors one obvious next step.","buttonText":"Contact Us","buttonUrl":"/contact","background":"dark"}}
      ],
      "root":{"props":{}}
    }'::jsonb
  ),
  (
    'about','/about','About',
    '{
      "content":[
        {"type":"HeroBlock","props":{"id":"about-hero","eyebrow":"About","heading":"Tell people who you are.","headingLevel":"h1","accent":"","text":"Use this page for the company story, team, experience, values, and what makes the business different.","primaryButtonText":"","primaryButtonUrl":"","secondaryButtonText":"","secondaryButtonUrl":"","note":"","image":"","imageAlt":"","background":"light"}},
        {"type":"HeadingBlock","props":{"id":"about-story","text":"Our story","level":"h2","align":"left"}},
        {"type":"TextBlock","props":{"id":"about-story-copy","text":"Replace this text with the business story.","align":"left"}}
      ],
      "root":{"props":{}}
    }'::jsonb
  ),
  (
    'services','/services','Services',
    '{
      "content":[
        {"type":"HeroBlock","props":{"id":"services-hero","eyebrow":"Services","heading":"What we can help you with.","headingLevel":"h1","accent":"","text":"Introduce the core services and make it easy for customers to understand the offer.","primaryButtonText":"Request a Quote","primaryButtonUrl":"/contact","secondaryButtonText":"","secondaryButtonUrl":"","note":"","image":"","imageAlt":"","background":"light"}},
        {"type":"HeadingBlock","props":{"id":"services-heading","text":"Our services","level":"h2","align":"left"}},
        {"type":"TextBlock","props":{"id":"services-copy","text":"Use Image + Text blocks, headings, and calls to action to build out the service list.","align":"left"}},
        {"type":"CtaBlock","props":{"id":"services-cta","heading":"Need a quote?","headingLevel":"h2","text":"Tell us what you need and we will follow up.","buttonText":"Request a Quote","buttonUrl":"/contact","background":"dark"}}
      ],
      "root":{"props":{}}
    }'::jsonb
  ),
  (
    'contact','/contact','Contact',
    '{
      "content":[
        {"type":"HeroBlock","props":{"id":"contact-hero","eyebrow":"Contact","heading":"Tell us what you need.","headingLevel":"h1","accent":"","text":"Use the request form below to send the details.","primaryButtonText":"","primaryButtonUrl":"","secondaryButtonText":"","secondaryButtonUrl":"","note":"","image":"","imageAlt":"","background":"light"}},
        {"type":"ServiceRequestBlock","props":{"id":"contact-request","eyebrow":"Request a quote","heading":"How can we help?","text":"Share the service, timeline and details and we will follow up.","serviceOptions":"general|General Enquiry,service|Service Request,quote|Quote Request,other|Other","submitButtonText":"Send Request","successHeading":"Request received.","successText":"Thanks. We will review your request and follow up."}}
      ],
      "root":{"props":{}}
    }'::jsonb
  ),
  (
    'privacy','/privacy','Privacy Policy',
    '{
      "content":[
        {"type":"HeroBlock","props":{"id":"privacy-hero","eyebrow":"Legal","heading":"Privacy Policy","headingLevel":"h1","accent":"","text":"Replace this template content with the final privacy policy before launch.","primaryButtonText":"","primaryButtonUrl":"","secondaryButtonText":"","secondaryButtonUrl":"","note":"","image":"","imageAlt":"","background":"light"}},
        {"type":"TextBlock","props":{"id":"privacy-copy","text":"Add the business privacy policy here before production launch.","align":"left"}}
      ],
      "root":{"props":{}}
    }'::jsonb
  ),
  (
    'terms','/terms','Terms of Service',
    '{
      "content":[
        {"type":"HeroBlock","props":{"id":"terms-hero","eyebrow":"Legal","heading":"Terms of Service","headingLevel":"h1","accent":"","text":"Replace this template content with the final terms before launch.","primaryButtonText":"","primaryButtonUrl":"","secondaryButtonText":"","secondaryButtonUrl":"","note":"","image":"","imageAlt":"","background":"light"}},
        {"type":"TextBlock","props":{"id":"terms-copy","text":"Add the business terms of service here before production launch.","align":"left"}}
      ],
      "root":{"props":{}}
    }'::jsonb
  )
)
insert into public.site_pages (site_key,page_id,path,title,content,published_at,updated_at)
select 'template',page_id,path,title,content,now(),now()
from page_seed
on conflict (site_key,page_id) do nothing;

insert into public.site_page_drafts (site_key,page_id,path,title,content,updated_at)
select site_key,page_id,path,title,content,now()
from public.site_pages
where site_key='template'
on conflict (site_key,page_id) do nothing;

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values
  ('site-assets','site-assets',true,10485760,array['image/jpeg','image/png','image/webp','image/gif']),
  ('blog-images','blog-images',true,10485760,array['image/jpeg','image/png','image/webp','image/gif']),
  ('social-videos','social-videos',true,104857600,array['video/mp4','video/quicktime','video/webm','video/x-m4v']),
  ('social-audio','social-audio',true,26214400,array['audio/mpeg','audio/mp4','audio/wav','audio/aac','audio/ogg'])
on conflict (id) do nothing;

drop policy if exists "public read template media" on storage.objects;
create policy "public read template media"
on storage.objects for select
to public
using (bucket_id in ('site-assets','blog-images','social-videos','social-audio'));

drop policy if exists "site admin upload template media" on storage.objects;
create policy "site admin upload template media"
on storage.objects for insert
to authenticated
with check (
  bucket_id in ('site-assets','blog-images','social-videos','social-audio')
  and public.is_site_admin()
);

drop policy if exists "site admin update template media" on storage.objects;
create policy "site admin update template media"
on storage.objects for update
to authenticated
using (
  bucket_id in ('site-assets','blog-images','social-videos','social-audio')
  and public.is_site_admin()
)
with check (
  bucket_id in ('site-assets','blog-images','social-videos','social-audio')
  and public.is_site_admin()
);

drop policy if exists "site admin delete template media" on storage.objects;
create policy "site admin delete template media"
on storage.objects for delete
to authenticated
using (
  bucket_id in ('site-assets','blog-images','social-videos','social-audio')
  and public.is_site_admin()
);

-- IMPORTANT:
-- After the admin user has signed in with Google at least once, authorize that
-- email for browser-based media uploads:
-- insert into public.site_admins(email) values ('owner@example.com')
-- on conflict (email) do nothing;
