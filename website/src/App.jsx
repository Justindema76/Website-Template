import { Route, Routes, useParams } from 'react-router-dom';
import Layout from './components/Layout';
import SEO from './components/SEO';
import ManagedPage from './pages/ManagedPage';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';

function DynamicManagedPage() {
  const { pageId = 'home' } = useParams();
  return <ManagedPage pageId={pageId} />;
}

export default function App() {
  return <>
    <SEO />
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<ManagedPage pageId="home" />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/:pageId" element={<DynamicManagedPage />} />
        <Route path="*" element={<main className="status-page"><h1>Page not found.</h1></main>} />
      </Route>
    </Routes>
  </>;
}
