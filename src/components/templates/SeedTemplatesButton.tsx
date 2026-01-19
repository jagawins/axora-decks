import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import seedData from '@/data/axora-templates.seed.json';

interface SeedTemplatesButtonProps {
  onSeeded: () => void;
}

export function SeedTemplatesButton({ onSeeded }: SeedTemplatesButtonProps) {
  const [seeding, setSeeding] = useState(false);
  const { toast } = useToast();

  const handleSeed = async () => {
    setSeeding(true);

    try {
      const { data, error } = await supabase.functions.invoke('seed-templates', {
        body: seedData,
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: 'Templates seeded!',
          description: `Added ${data.templatesCount} templates with ${data.blocksCount} blocks.`,
        });
        onSeeded();
      } else {
        throw new Error(data?.error || 'Failed to seed templates');
      }
    } catch (error) {
      console.error('Error seeding templates:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to seed templates.',
        variant: 'destructive',
      });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleSeed} 
      disabled={seeding}
      className="gap-2"
    >
      {seeding ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Database className="h-4 w-4" />
      )}
      {seeding ? 'Seeding...' : 'Seed Templates'}
    </Button>
  );
}
