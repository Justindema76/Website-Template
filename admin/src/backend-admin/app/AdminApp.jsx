import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import AdminLogin from '../auth/AdminLogin';
import RequireAdmin from '../auth/RequireAdmin';
import AdminLayout from '../components/layout/AdminLayout';
import Dashboard from '../features/dashboard/Dashboard';
import ServiceRequestsAdmin from '../features/service-requests/ServiceRequestsAdmin';
import BlogAdmin from '../features/blog/BlogAdmin';
import MediaAdmin from '../features/media/MediaAdmin';
import SettingsAdmin from '../features/settings/SettingsAdmin';
import SiteBuilder from '../features/site-builder/SiteBuilder';
import WebsitePages from '../features/site-builder/WebsitePages';
import BlockLibrary from '../features/site-builder/BlockLibrary';
import GlobalBuilder from '../features/site-builder/GlobalBuilder';
import GlobalStylesAdmin from '../features/site-builder/GlobalStylesAdmin';
import SocialAdmin from '../features/social-links/SocialAdmin';
import VideosAdmin from '../features/videos/VideosAdmin';

function GlobalSectionRoute() {
  const { section } = useParams();
  if (!['header', 'footer', 'project-request'].includes(section)) {
    return <Navigate to="/admin" replace />;
  }
  return <GlobalBuilder />;
}

export default function AdminApp() {
  return <Routes>
    <Route path="/admin-login" element={<AdminLogin />} />
    <Route element={<RequireAdmin />}>
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/service-requests" element={<ServiceRequestsAdmin />} />
        <Route path="/admin/blog" element={<BlogAdmin />} />
        <Route path="/admin/blog/:id" element={<BlogAdmin />} />
        <Route path="/admin/videos" element={<VideosAdmin />} />
        <Route path="/admin/videos/:id" element={<VideosAdmin />} />
        <Route path="/admin/media" element={<MediaAdmin />} />
        <Route path="/admin/social" element={<SocialAdmin />} />
        <Route path="/admin/website/pages" element={<WebsitePages />} />
        <Route path="/admin/website/pages/:pageId" element={<SiteBuilder />} />
        <Route path="/admin/website/blocks" element={<BlockLibrary />} />
        <Route path="/admin/website/styles" element={<GlobalStylesAdmin />} />
        <Route path="/admin/website/global/:section" element={<GlobalSectionRoute />} />
        <Route path="/admin/settings" element={<SettingsAdmin />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/admin" replace />} />
  </Routes>;
}
