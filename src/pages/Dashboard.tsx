import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, Plus, Sparkles, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { LibrarySidebar } from '@/components/library/LibrarySidebar';
import { LibraryHeader } from '@/components/library/LibraryHeader';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { LibraryActionBar } from '@/components/library/LibraryActionBar';
import { LibraryTabs, LibraryFilter } from '@/components/library/LibraryTabs';
import { ProjectCard } from '@/components/library/ProjectCard';
import { CreateProjectModal } from '@/components/library/CreateProjectModal';
import { RenameModal } from '@/components/library/RenameModal';
import { CreateDeckModal } from '@/components/CreateDeckModal';
import { ImportContentModal } from '@/components/ImportContentModal';
import { TemplatesGrid } from '@/components/templates/TemplatesGrid';
import { SUBSCRIPTION_TIERS, getProjectLimit } from '@/lib/subscription';
import { fetchTemplates, Template } from '@/lib/templates';
import { FirstDeckModal } from '@/components/FirstDeckModal';
import { BrandKitCard } from '@/components/dashboard/BrandKitCard';
import InfographicGenerator from '@/components/infographics/InfographicGenerator';
import DataVisualsGenerator from '@/components/datavisuals/DataVisualsGenerator';
import ThemesLibrary from '@/components/themes/ThemesLibrary';

interface Project {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  last_viewed_at: string | null;
  is_favorite: boolean;
  folder_id: string | null;
}

interface Profile {
  name: string | null;
}

/* ── Templates sub-tabs (Templates | AI Infographics) ─────────── */
function DashboardTemplatesTabs({
  templates,
  templatesLoading,
  onRefreshTemplates,
}: {
  templates: Template[];
  templatesLoading: boolean;
  onRefreshTemplates: () => Promise<void>;
}) {
  const [subTab, setSubTab] = useState<'templates' | 'infographics' | 'data-visuals'>('templates');

  return (
    <>
      <div className="flex items-center gap-1 border-b border-border -mt-2">
        <button
          onClick={() => setSubTab('templates')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative ${
            subTab === 'templates' ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="h-4 w-4" />
          Templates
          {subTab === 'templates' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setSubTab('infographics')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative ${
            subTab === 'infographics' ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          AI Infographics
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent/10 text-accent uppercase">
            BETA
          </span>
          {subTab === 'infographics' && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent rounded-t-full" />
          )}
        </button>
      </div>

      {subTab === 'templates' && (
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold">Templates</h1>
            <p className="text-muted-foreground max-w-2xl mt-1">
              Professional templates for every use case. Click any template to create a new deck with pre-built content.
            </p>
          </div>
          <TemplatesGrid
            templates={templates}
            loading={templatesLoading}
            onRefresh={onRefreshTemplates}
          />
        </div>
      )}

      {subTab === 'infographics' && (
        <div className="py-4">
          <InfographicGenerator />
        </div>
      )}
    </>
  );
}

const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { subscription, loading: subscriptionLoading, checkSubscription, createCheckout, openCustomerPortal } = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // UI state
  const [sidebarTab, setSidebarTab] = useState('library');
  const [activeFilter, setActiveFilter] = useState<LibraryFilter>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateAIOpen, setIsCreateAIOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameProjectId, setRenameProjectId] = useState<string | null>(null);
  const [renameCurrentTitle, setRenameCurrentTitle] = useState('');
  const [firstDeckOpen, setFirstDeckOpen] = useState(false);

  // Handle checkout success/canceled query params
  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');
    if (checkoutStatus === 'success') {
      toast({
        title: 'Subscription activated!',
        description: 'Thank you for subscribing. Your account has been upgraded.',
      });
      checkSubscription();
      navigate('/dashboard', { replace: true });
    } else if (checkoutStatus === 'canceled') {
      toast({
        title: 'Checkout canceled',
        description: 'Your subscription checkout was canceled.',
        variant: 'destructive',
      });
      navigate('/dashboard', { replace: true });
    }
  }, [searchParams, navigate, toast, checkSubscription]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Fetch projects and profile
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (profileData) {
        setProfile(profileData);
      }

      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      const projectsList = (projectsData || []) as Project[];
      setProjects(projectsList);
      // Show first deck modal if user has zero projects
      if (projectsList.length === 0) {
        setFirstDeckOpen(true);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your decks.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtered projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(query));
    }

    // Apply tab filter
    switch (activeFilter) {
      case 'recent':
        result = result.sort((a, b) => {
          const aTime = a.last_viewed_at ? new Date(a.last_viewed_at).getTime() : 0;
          const bTime = b.last_viewed_at ? new Date(b.last_viewed_at).getTime() : 0;
          return bTime - aTime;
        });
        break;
      case 'favorites':
        result = result.filter(p => p.is_favorite);
        break;
      case 'created':
      case 'all':
      default:
        // Already sorted by updated_at
        break;
    }

    return result;
  }, [projects, searchQuery, activeFilter]);

  // Actions
  const handleCreateProject = async (title: string, description: string) => {
    if (!user) return;

    const projectLimit = getProjectLimit(subscription.tier);
    if (projectLimit !== -1 && projects.length >= projectLimit) {
      toast({
        title: 'Project limit reached',
        description: 'Upgrade to Pro for unlimited projects.',
        variant: 'destructive',
      });
      return;
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        title,
        description: description || null,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to create deck.', variant: 'destructive' });
      return;
    }

    setProjects([data as Project, ...projects]);
    navigate(`/editor/${data.id}`);
  };

  const handleOpenProject = async (id: string) => {
    // Update last_viewed_at
    await supabase
      .from('projects')
      .update({ last_viewed_at: new Date().toISOString() })
      .eq('id', id);

    navigate(`/editor/${id}`);
  };

  const handleRename = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setRenameProjectId(id);
      setRenameCurrentTitle(project.title);
      setRenameModalOpen(true);
    }
  };

  const handleRenameSubmit = async (newTitle: string) => {
    if (!renameProjectId) return;

    const { error } = await supabase
      .from('projects')
      .update({ title: newTitle })
      .eq('id', renameProjectId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to rename deck.', variant: 'destructive' });
      return;
    }

    setProjects(projects.map(p => 
      p.id === renameProjectId ? { ...p, title: newTitle } : p
    ));
    toast({ title: 'Renamed', description: `Deck renamed to "${newTitle}".` });
  };

  const handleDuplicate = async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project || !user) return;

    const { data: newProject, error: projectError } = await supabase
      .from('projects')
      .insert({
        title: `${project.title} (Copy)`,
        description: project.description,
        user_id: user.id,
        theme: (project as any).theme || 'classic',
      })
      .select()
      .single();

    if (projectError || !newProject) {
      toast({ title: 'Error', description: 'Failed to duplicate deck.', variant: 'destructive' });
      return;
    }

    // Copy blocks
    const { data: blocks } = await supabase
      .from('blocks')
      .select('*')
      .eq('project_id', id)
      .order('order_index');

    if (blocks && blocks.length > 0) {
      await supabase.from('blocks').insert(
        blocks.map(b => ({
          project_id: newProject.id,
          type: b.type,
          content: b.content,
          order_index: b.order_index,
        }))
      );
    }

    setProjects([newProject as Project, ...projects]);
    toast({ title: 'Duplicated', description: `Created "${newProject.title}".` });
  };

  const handleMoveToFolder = (id: string) => {
    // TODO: Implement folder selection modal
    toast({ title: 'Coming soon', description: 'Folder organization is coming soon.' });
  };

  const handleToggleFavorite = async (id: string, isFavorite: boolean) => {
    const { error } = await supabase
      .from('projects')
      .update({ is_favorite: isFavorite })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update favorite status.', variant: 'destructive' });
      return;
    }

    setProjects(projects.map(p => 
      p.id === id ? { ...p, is_favorite: isFavorite } : p
    ));
    toast({ 
      title: isFavorite ? 'Added to favorites' : 'Removed from favorites',
    });
  };

  const handleDelete = async (id: string, title: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete deck.', variant: 'destructive' });
      return;
    }

    setProjects(projects.filter(p => p.id !== id));
    toast({ title: 'Deleted', description: `"${title}" has been deleted.` });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleManageSubscription = async () => {
    const url = await openCustomerPortal();
    if (url) {
      window.open(url, '_blank');
    } else {
      toast({
        title: 'Error',
        description: 'Failed to open subscription management.',
        variant: 'destructive',
      });
    }
  };

  const handleUpgrade = async () => {
    const priceId = SUBSCRIPTION_TIERS.pro.monthlyPriceId;
    if (!priceId) return;

    const url = await createCheckout(priceId);
    if (url) {
      window.open(url, '_blank');
    } else {
      toast({
        title: 'Error',
        description: 'Failed to create checkout session.',
        variant: 'destructive',
      });
    }
  };

  const handleSidebarTabChange = async (tab: string) => {
    if (tab === 'upgrade') {
      handleUpgrade();
      return;
    }
    if (tab === 'settings') {
      navigate('/settings');
      return;
    }
    setSidebarTab(tab);
    
    // Load templates when switching to templates tab
    if (tab === 'templates' && templates.length === 0) {
      setTemplatesLoading(true);
      try {
        const data = await fetchTemplates();
        setTemplates(data);
      } catch (error) {
        console.error('Error loading templates:', error);
        toast({
          title: 'Error',
          description: 'Failed to load templates.',
          variant: 'destructive',
        });
      } finally {
        setTemplatesLoading(false);
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const projectLimit = getProjectLimit(subscription.tier);
  const canCreate = projectLimit === -1 || projects.length < projectLimit;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:flex md:flex-col md:h-screen md:sticky md:top-0">
        <LibrarySidebar 
          activeTab={sidebarTab}
          onTabChange={handleSidebarTabChange}
          onManageSubscription={handleManageSubscription}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <LibraryHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          userName={profile?.name || user?.email}
          onSignOut={handleSignOut}
        />

        {/* Content area */}
        <main className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6">
          {sidebarTab === 'library' && (
            <>
              {/* Brand Kit Card - top of library */}
              <div className="mb-6">
                <BrandKitCard />
              </div>

              {/* Action bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h1 className="text-2xl font-bold">Library</h1>
                <LibraryActionBar
                  onCreateNew={() => setIsCreateOpen(true)}
                  onNewWithAI={() => setIsCreateAIOpen(true)}
                  onImport={() => setIsImportOpen(true)}
                />
              </div>

              {/* Tabs */}
              <LibraryTabs 
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />

              {/* Project limit banner for free users */}
              {subscription.tier === 'free' && projects.length >= 2 && (
                <div className="mt-6 glass-card p-4 border-accent/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {projects.length} of {projectLimit} decks used
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Upgrade for unlimited decks and premium features
                      </p>
                    </div>
                    <Button variant="hero-outline" size="sm" onClick={handleUpgrade}>
                      Upgrade
                    </Button>
                  </div>
                </div>
              )}

              {/* Project grid/list */}
              <div className="mt-6">
                {filteredProjects.length === 0 ? (
                  <div className="text-center py-16 glass-card">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {searchQuery ? 'No decks found' : 'No decks yet'}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {searchQuery 
                        ? 'Try a different search term' 
                        : 'Create your first deck to get started'}
                    </p>
                    {!searchQuery && (
                      <div className="flex items-center justify-center gap-3">
                        <Button variant="outline" onClick={() => setIsCreateOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create new
                        </Button>
                        <Button variant="hero" onClick={() => setIsCreateAIOpen(true)}>
                          <Sparkles className="h-4 w-4 mr-2" />
                          New with AI
                        </Button>
                      </div>
                    )}
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        id={project.id}
                        title={project.title}
                        coverImageUrl={project.cover_image_url}
                        lastViewedAt={project.last_viewed_at}
                        updatedAt={project.updated_at}
                        isFavorite={project.is_favorite}
                        viewMode="grid"
                        onOpen={handleOpenProject}
                        onRename={handleRename}
                        onDuplicate={handleDuplicate}
                        onMoveToFolder={handleMoveToFolder}
                        onToggleFavorite={handleToggleFavorite}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        id={project.id}
                        title={project.title}
                        coverImageUrl={project.cover_image_url}
                        lastViewedAt={project.last_viewed_at}
                        updatedAt={project.updated_at}
                        isFavorite={project.is_favorite}
                        viewMode="list"
                        onOpen={handleOpenProject}
                        onRename={handleRename}
                        onDuplicate={handleDuplicate}
                        onMoveToFolder={handleMoveToFolder}
                        onToggleFavorite={handleToggleFavorite}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {sidebarTab === 'home' && (
            <div className="text-center py-16">
              <h1 className="text-2xl font-bold mb-4">Welcome back!</h1>
              <p className="text-muted-foreground mb-8">
                Start creating or browse your library
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Button variant="hero" onClick={() => setIsCreateAIOpen(true)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  New with AI
                </Button>
                <Button variant="outline" onClick={() => navigate('/create?mode=research')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Create with Research
                </Button>
                <Button variant="outline" onClick={() => setSidebarTab('library')}>
                  Browse Library
                </Button>
              </div>
            </div>
          )}

          {sidebarTab === 'templates' && (
            <div className="space-y-6">
              {/* Sub-tabs: Templates | AI Infographics */}
              <div className="flex items-center gap-1 border-b border-border">
                <button
                  onClick={() => {
                    const el = document.getElementById('tmpl-subtab');
                    if (el) el.dataset.tab = 'templates';
                    // Force re-render via a state the component already has
                    setTemplatesLoading((v) => v);
                  }}
                  className="hidden"
                  id="tmpl-templates-btn"
                />
              </div>
              <DashboardTemplatesTabs
                templates={templates}
                templatesLoading={templatesLoading}
                onRefreshTemplates={async () => {
                  setTemplatesLoading(true);
                  try {
                    const data = await fetchTemplates();
                    setTemplates(data);
                  } finally {
                    setTemplatesLoading(false);
                  }
                }}
              />
            </div>
          )}

          {sidebarTab === 'themes' && (
            <ThemesLibrary />
          )}

          {sidebarTab === 'settings' && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-3">
                <p className="text-muted-foreground">Redirecting to Settings…</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateProjectModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateProject}
      />

      <CreateDeckModal
        open={isCreateAIOpen}
        onOpenChange={setIsCreateAIOpen}
      />

      <ImportContentModal
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
      />

      <RenameModal
        open={renameModalOpen}
        onOpenChange={setRenameModalOpen}
        currentTitle={renameCurrentTitle}
        onSubmit={handleRenameSubmit}
      />

      <FirstDeckModal
        open={firstDeckOpen}
        onOpenChange={setFirstDeckOpen}
      />

      {/* Mobile bottom nav */}
      <MobileBottomNav
        activeTab={sidebarTab}
        onTabChange={(tab) => {
          if (tab === 'generate') {
            navigate('/create');
          } else {
            handleSidebarTabChange(tab);
          }
        }}
      />
    </div>
  );
};

export default Dashboard;
