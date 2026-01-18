import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  FileText, 
  LogOut, 
  Loader2, 
  Calendar,
  MoreHorizontal,
  Trash2,
  Pencil,
  Lock,
  CreditCard,
  Crown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axoraLogo from "@/assets/axora-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SUBSCRIPTION_TIERS, getProjectLimit } from '@/lib/subscription';

interface Project {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface Profile {
  name: string | null;
}

const Dashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { subscription, loading: subscriptionLoading, checkSubscription, createCheckout, openCustomerPortal } = useSubscription();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  // Handle checkout success/canceled query params
  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');
    if (checkoutStatus === 'success') {
      toast({
        title: 'Subscription activated!',
        description: 'Thank you for subscribing. Your account has been upgraded.',
      });
      checkSubscription();
      // Clear the query param
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

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (profileData) {
        setProfile(profileData);
      }

      // Fetch projects
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      setProjects(projectsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your projects.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!user || !newTitle.trim()) return;

    // Check tier limits for free users
    const projectLimit = getProjectLimit(subscription.tier);
    if (projectLimit !== -1 && projects.length >= projectLimit) {
      toast({
        title: 'Project limit reached',
        description: 'Upgrade to Pro for unlimited projects.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          title: newTitle.trim(),
          description: newDescription.trim() || null,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setProjects([data, ...projects]);
      setIsCreateOpen(false);
      setNewTitle('');
      setNewDescription('');
      
      toast({
        title: 'Project created',
        description: `"${data.title}" has been created.`,
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      setProjects(projects.filter(p => p.id !== projectId));
      toast({
        title: 'Project deleted',
        description: `"${projectTitle}" has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project.',
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleUpgrade = async (priceId: string) => {
    setIsCheckoutLoading(true);
    try {
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
    } finally {
      setIsCheckoutLoading(false);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const projectLimit = getProjectLimit(subscription.tier);
  const canCreateProject = projectLimit === -1 || projects.length < projectLimit;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container-wide">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={axoraLogo} alt="Axora" className="h-8 w-auto" />
            </div>

            <div className="flex items-center gap-4">
              {/* Tier badge */}
              <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                subscription.tier === 'executive' 
                  ? 'bg-success/20 text-success' 
                  : subscription.tier === 'pro' 
                    ? 'bg-accent/20 text-accent' 
                    : 'bg-muted text-muted-foreground'
              }`}>
                {subscription.tier === 'executive' && <Crown className="h-3 w-3 inline mr-1" />}
                {subscription.tier}
              </span>

              {/* Manage subscription button for paid users */}
              {subscription.subscribed && (
                <Button variant="ghost" size="sm" onClick={handleManageSubscription}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage
                </Button>
              )}

              <span className="text-sm text-muted-foreground hidden sm:block">
                {profile?.name || user?.email}
              </span>

              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container-wide py-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Projects</h1>
            {subscription.tier === 'free' && (
              <p className="text-muted-foreground mt-1">
                {projects.length} of {projectLimit} projects used
              </p>
            )}
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" disabled={!canCreateProject}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
                {!canCreateProject && <Lock className="h-3 w-3 ml-2" />}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create new project</DialogTitle>
                <DialogDescription>
                  Start a new presentation project
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Q4 Strategy Deck"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of your project..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="bg-muted/50 resize-none"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="hero" 
                  onClick={handleCreateProject}
                  disabled={!newTitle.trim() || isCreating}
                >
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Create'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tier upgrade banner for free users */}
        {subscription.tier === 'free' && projects.length >= 2 && (
          <div className="glass-card p-6 mb-8 border-accent/20">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg">Upgrade to Pro</h3>
                <p className="text-muted-foreground text-sm">
                  Get unlimited projects, PDF/slide exports, and brand kit integration.
                </p>
              </div>
              <Button 
                variant="hero-outline" 
                onClick={() => handleUpgrade(SUBSCRIPTION_TIERS.pro.priceId!)}
                disabled={isCheckoutLoading}
              >
                {isCheckoutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upgrade Now'}
              </Button>
            </div>
          </div>
        )}

        {/* Projects grid */}
        {projects.length === 0 ? (
          <div className="text-center py-16 glass-card">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first project to get started
            </p>
            <Button variant="hero" onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group glass-card p-6 card-hover cursor-pointer"
                onClick={() => navigate(`/editor/${project.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-accent" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/editor/${project.id}`);
                      }}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id, project.title);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                  {project.title}
                </h3>
                {project.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {project.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Updated {formatDate(project.updated_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
